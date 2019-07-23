import { Component, OnInit } from '@angular/core';
import { Project } from '../shared/taskshared/project.model';
import { User } from '../shared/taskshared/user.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../shared/taskshared/user.service';
import { TitleCasePipe, DatePipe } from '@angular/common';
import { FilterProjectPipe } from '../filter-project.pipe';
import { ProjectService } from '../shared/taskshared/project.service';

declare var $: any;
@Component({
  selector: 'app-add-project',
  templateUrl: './add-project.component.html',
  styleUrls: ['./add-project.component.css'],
  providers: [[UserService, ProjectService, TitleCasePipe, FilterProjectPipe]]
})
  export class AddProjectComponent implements OnInit {

    addProjectForm: FormGroup;
    today: Date;
    tomorrow: Date;
    projects: Project[];
    filteredProjects: Project[];
    usersList: User[];
    searchText: string;
    searchUser: string;
    selectedUser: string;
    selectedUserId: number;
    saveUserId: number;
    saveUsereditId: string;
    saveUseronE: string;
    saveUserforE: number;
    oldUserId: number;
    newUserId: number;
    userupdateind: boolean;
    saveProjectId: number;
    editable: boolean;
    editId: number;
    error: string;
    tempProject: Project;
    addProject: Project;
    editProject: Project;
    updateUser:User;
    tempUsr: User;
    projByNm: Project;
    userOnEdit: User;
  
  
  
    constructor(private fb: FormBuilder,
                private userService: UserService,
                private projectService: ProjectService,
                private titleCasePipe: TitleCasePipe,
                private filterProjectPipe: FilterProjectPipe
                ) { }
  
    ngOnInit() {
      this.setDefaultDate();
      this.createForm();
      this.userService.getusers().subscribe(data => {
        this.usersList = data;
      }, error => {
        console.log(error);
      });
      this.listProjects();
    }
  
    dateFormatter(date: Date, format: string): any {
      if (!date) { return null; }
      return new DatePipe('en-US').transform(date, format);
    }
  
    setDefaultDate() {
      const date1 = new Date();
      const date2 = new Date(date1.setDate(date1.getDate() + 1));
      this.today = this.dateFormatter(new Date(), 'yyyy-MM-dd');
      this.tomorrow = this.dateFormatter(date2, 'yyyy-MM-dd');
      if (this.addProjectForm) {
        let start, end;
        start = this.addProjectForm.get('startDate').value;
        end = this.addProjectForm.get('endDate').value;
        if (!start || !end) {
          this.addProjectForm.patchValue({
            startDate: this.today,
            endDate: this.tomorrow
          });
        }
      }
    }
  
    createForm() {
      this.addProjectForm = this.fb.group({
        project: [null, Validators.required],
        priority: [0, Validators.required],
        setDate: false,
        startDate: [{ value: this.today, disabled: true }, [Validators.required]],
        endDate: [{ value: this.tomorrow, disabled: true }, [Validators.required]],
        manager: [{ value: null, disabled: true }, Validators.required]
      }, { validator: this.DateValidator() });
    }
  
    resetForm() {
      this.addProjectForm.reset({
        priority: 0,
        startDate: { value: this.today, disabled: true },
        endDate: { value: this.tomorrow, disabled: true },
        setDate: false
      });
      this.selectedUser = null;
      this.searchUser = null;
      this.selectedUserId = null;
    }
  
    onSelect(event) {
      const status = event.target.checked;
      console.log(status);
      if (status) {
        this.addProjectForm.get('startDate').enable();
        this.addProjectForm.get('endDate').enable();
      } else {
        this.setDefaultDate();
        this.addProjectForm.get('startDate').disable();
        this.addProjectForm.get('endDate').disable();
      }
    }
  
    DateValidator() {
      return (group: FormGroup): { [key: string]: any } => {
        const startDate = new Date(group.controls.startDate.value);
        const endDate = new Date(group.controls.endDate.value);
        if ((endDate.getTime() < startDate.getTime())) {
          return {
            dates: 'Start/End date is incorrect'
          };
        }
        return {};
      };
    }
  
    onAdd() {
      console.log(this.addProjectForm.value);
      this.addProject = this.addProjectForm.value;
      this.addProject.userId = this.selectedUserId;
      this.saveUserId = this.selectedUserId;
      console.log(this.addProject);
      this.projectService.addProject(this.addProject).subscribe(data => {
        this.resetForm();
        this.updateUserOnAdd(this.saveUserId);
        this.listProjects();
        this.error = null;
      }, error => {
        this.error = 'Atleast one of the field has error !!';
        console.log(error);
      });
    }
  
    updateUserOnAdd(useridsent: any){
      this.projectService.getProjectByPName(this.addProject.project).subscribe(projectret => {
        this.saveProjectId = projectret.projectId;
      }, error => {
          this.error = 'Error getting project by name!!';
          console.log(error);
      });
      
      this.userService.getuser(useridsent).subscribe(result => {
        result.projectId = this.saveProjectId;
        this.updateUser = result;
        this.userService.updateuser(this.updateUser).subscribe(updates => {
          console.log('user updated');
        }, error => {
          this.error = 'Error updating User with project id !!';
          console.log(error);
        });
        }, error => {
          this.error = 'Error getting the user  !!';
          console.log(error);
      });
    }
  
    saveUser() {
      const temp = this.selectedUser.split('-');
      //window.location.hash = String(temp[0].trim());
      this.selectedUserId = +temp[0].trim();
      this.addProjectForm.patchValue({
        manager: temp[1].trim()
      });
     $('#UserModal').modal('hide');
    }
  
    listProjects() {
      this.projectService.getProjects().subscribe(data => {
        this.projects = data;
        this.projects.forEach(project => {
          this.projectService.getTotalTasks(project.projectId).subscribe(result => {
            if (result) {
              project.tasks = result;
            } else {
              project.tasks = 0;
            }
          });
          this.projectService.getCompletedTasks(project.projectId).subscribe(result => {
            if (result) {
              project.completed = result;
            } else {
              project.completed = 0;
            }
          });
        });
        this.filteredProjects = this.projects;
      }, error => {
        console.log(error);
      });
  
    }
  
    clearFilter() {
      this.listProjects();
      this.searchText = null;
    }
  
  
    sort(basis){
      // sort by employeeId
      if (basis === 'startDate') {
        this.filteredProjects.sort((a, b) => {
          const dateA = a.startDate;
          const dateB = b.startDate;
          if (dateA < dateB) {
            return -1;
          }
          if (dateA > dateB) {
            return 1;
          }
          return 0;
        });
      } else if (basis === 'endDate') {
        // sort by end date
        this.filteredProjects.sort((a, b) => {
          const dateA = a.endDate;
          const dateB = b.endDate;
          if (dateA < dateB) {
            return -1;
          }
          if (dateA > dateB) {
            return 1;
          }
          return 0;
        });
      } else if(basis === 'priority'){
        // sort by priority
        this.filteredProjects.sort((a, b) => {
          return +a.priority - +b.priority;
        });
      }else if(basis === 'completed'){
        // sort by completed
        this.filteredProjects.sort((a, b) => {
          return +a.completed - +b.completed;
        });
      }
    }
    cancelEdit() {
      this.resetForm();
      this.editable = false;
      this.editId = null;
      this.error = null;
    }
  
    onEdit(projectId) {
      this.projectService.getProject(projectId).subscribe(result => {
        console.log('result is', result);
        this.getuserIdfromprojectId(projectId);
        this.addProjectForm.patchValue({
          project: result.project,
          startDate: this.dateFormatter(new Date(result.startDate), 'yyyy-MM-dd'),
          endDate: this.dateFormatter(new Date(result.endDate), 'yyyy-MM-dd'),
          priority: result.priority,
          setDate: false,
          manager: result.manager,
          userId:result.userId,
          projectId:result.projectId
        });
        this.editable = true;
        this.editId = projectId;
      }, error => {
        console.log(error);
      });
    }
  
    getuserIdfromprojectId(projectId) {
      this.userService.getuserByProjectId(projectId).subscribe(data =>{
        this.userOnEdit = data;
        this.saveUseronE = data.firstName + ' ' + data.lastName;
        this.saveUserforE = data.userId;
        console.log(this.userOnEdit);
        console.log('here is our user' + this.saveUseronE);
        this.addProjectForm.patchValue({
          manager: this.saveUseronE
        });
      }, error => {
          this.error = 'Error user fromproject id !!';
          console.log(error);
      });
    }
  
    getManager(user_id) {
      // console.log('ger passed to get manager' + user_id);
      this.userService.getuser(user_id).subscribe(data => {
        this.selectedUser = data.projectId + ' - ' + data.firstName + ' ' + data.lastName;
        this.addProjectForm.patchValue({
          manager: this.titleCasePipe.transform(this.selectedUser.split('-')[1].trim())
        });
      }, error => {
        console.log(error);
      });
    }
  
    onEditSave() {
      this.editProject = this.addProjectForm.value;
      if (this.selectedUser != null) {
        this.editProject.userId = +this.selectedUser.split('-')[0].trim();
        this.editProject.manager = this.selectedUser.split('-')[1].trim();
        this.userupdateind = true;
        this.oldUserId = this.saveUserforE;
        this.newUserId = +this.selectedUser.split('-')[0].trim();
      } else {
        this.editProject.userId = this.saveUserforE ;
        this.userupdateind = false;
        this.oldUserId = this.saveUserforE;
      }
      this.editProject.projectId = this.editId;
      console.log('lets finaly get down to editing ' + this.editProject);
      this.projectService.updateProject(this.editProject).subscribe(data => {
        this.editable = false;
        this.editId = null;
        this.resetForm();
        this.listProjects();
        this.error = null;
      }, error => {
        this.error = 'Atleast one of the field has error !!';
        console.log(error);
      });
      if (this.userupdateind) {
        // update project for new user
        this.userService.getuser(this.newUserId).subscribe(newusr => {
          console.log('get uniq done');
          newusr.projectId = this.editProject.projectId;
          this.tempUsr = newusr;
          // update here
          this.userService.updateuser(this.tempUsr).subscribe(updatdusr => {
            console.log('user updaed for edit project on prject manger change');
          }, error => {
            this.error = 'failed on new user update!!!';
            console.log(error);
          });
        }, error => {
          this.error = 'failed getting the new user for update !!';
          console.log(error);
        });
  
        // old user update................
        // update project for new user
        this.userService.getuser(this.oldUserId).subscribe(oldusr => {
          console.log('get uniq  for old user done');
          oldusr.projectId = 0;
          this.tempUsr = oldusr;
          // update here
          this.userService.updateuser(this.tempUsr).subscribe(updatOusr => {
            console.log('Old user updaed for edit project on prject manger change');
          }, error => {
            this.error = 'failed on old user update!!!';
            console.log(error);
          });
        }, error => {
          this.error = 'failed getting the old user for update !!';
          console.log(error);
        });
      }
    }
  
    suspendProject(projectId) {
      this.projectService.deleteProject(projectId).subscribe(data => {
        this.listProjects();
      }, error => {
        console.log(error);
      });
    }
  
    onSearch(text) {
      this.filteredProjects = this.filterProjectPipe.transform(this.projects, text);
    }
  
  }
  
