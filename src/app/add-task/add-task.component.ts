import { Component, OnInit } from '@angular/core';

import { TaskService } from '../shared/taskshared/task.service';

import { Task } from '../shared/taskshared/task.model';

import { ParentTask } from '../shared/taskshared/parent-task.model'
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../shared/taskshared/user.service';
import { ProjectService } from '../shared/taskshared/project.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Project } from '../shared/taskshared/project.model';
import { User } from '../shared/taskshared/user.model';
import { DatePipe } from '@angular/common';

declare var $: any;

@Component({
  selector: 'app-add-task',
  templateUrl: './add-task.component.html',
  styleUrls: ['./add-task.component.css'],
  providers: [UserService, ProjectService, TaskService]
})
export class AddTaskComponent implements OnInit {


  parentTasks: ParentTask[]=[];
  task: Task[];
  tasks: Task[]=[];
  filteredTasks: Task[];
  addTaskModel: Task;
  tempTask: Task;
  addTask:Task;
  disable: boolean = false;
  editTaskFlag : boolean = false;
  value: string;
  searchUser: string;
  searchProject: string;
  searchParent: string;
  parentsList:ParentTask[];
  selectedParent: string;
  selectedProject: string;
  selectedUser: string;
  taskForm: FormGroup;
  oldUser: string;
  oldUserId: any;
  today: Date;
  tomorrow: Date;
  projects :Project[];
  usersList : User[];
  wstaskId: number;
  editable = false;
  error: string;
  savePTasNm:string;
  editUser:User;

  

  constructor(private taskService: TaskService,
    private router:Router,
    private route:ActivatedRoute,
    private userService: UserService,
    private projectService: ProjectService,
    private fb: FormBuilder) { 
    
    if(this.taskService.task != null){
      this.task = this.taskService.task;
      this.taskService.task = null;
      this.editTaskFlag = this.taskService.editTaskFlag;
      this.taskService.editTaskFlag = false;
    }
  }

  ngOnInit() {
   
      this.getParentTask();
      this.projectService.getProjects().subscribe(data => {
        this.projects = data;
        console.log(this.projects);
      }, error => {
        console.log(error)
      })
      this.userService.getusers().subscribe(data => {
        this.usersList = data;
      }, error => {
        console.log(error);
      });
      this.setDefaultDate()
      this.createForm();
  
      this.wstaskId = +this.route.snapshot.queryParamMap.get('taskId');
      if (this.wstaskId) {
        this.editable = true;
        this.taskService.getTaskById(this.wstaskId).subscribe(data => {
          this.taskForm.patchValue({
            task: data.task,
            priority: data.priority,
            parentTaskFlag: false,
            startDate: this.dateFormatter(new Date(data.startDate), 'yyyy-MM-dd'),
            endDate: this.dateFormatter(new Date(data.endDate), 'yyyy-MM-dd'),
            user:data.user
          })
          if(data.parentId>0){
            this.taskService.getParentTaskById(data.parentId).subscribe(parnt => {
              this.taskForm.patchValue({
                parentTask: parnt.parentTask
              })
              this.selectedParent = String(data.parentId);
            })
          }
          this.projectService.getProject(data.projectId).subscribe(result => {
            this.taskForm.patchValue({
              project: result.project
            })
            this.selectedProject = result.projectId + '-' + result.project;
            this.getParentTasks(result.projectId);
          })   
         
         this.taskForm.get('parentTaskFlag').disable();
        })
      }
  }
 
  setDefaultDate() {
    let date1 = new Date();
    let date2 = new Date(date1.setDate(date1.getDate() + 1));
    this.today = this.dateFormatter(new Date(), 'yyyy-MM-dd');
    this.tomorrow = this.dateFormatter(date2, 'yyyy-MM-dd');
  }

  
  createForm() {
    this.taskForm = this.fb.group({
      project: [{ value: null, disabled: true }, Validators.required],
      task: [null, Validators.required],
      parentTaskFlag: false,
      priority: [0, Validators.required],
      parentTask: [{ value: null, disabled: true }],
      startDate: [this.today, Validators.required],
      endDate: [this.tomorrow, Validators.required],
      user: [{ value: null, disabled: true }, Validators.required]
    }, { validator: this.DateValidator() });
  }

  DateValidator() {
    return (group: FormGroup): { [key: string]: any } => {
      let startDate = new Date(group.controls["startDate"].value);
      let endDate = new Date(group.controls["endDate"].value);
      if (endDate.getTime() < startDate.getTime()) {
        return {
          dates: "Start/End date is incorrect"
        };
      }
      return {};
    }
  }
  dateFormatter(date: Date, format: string): any {
    if (!date) { return null; }
    return new DatePipe("en-US").transform(date, format);
  }

  onAdd() {
    if (this.taskForm.get('parentTaskFlag').value) {
      console.log('Parent task');
      this.tempTask = this.taskForm.value;
      this.savePTasNm = this.tempTask.task;  
      console.log('this is intermediate task', this.savePTasNm );
      this.taskService.addTask(this.tempTask).subscribe(data => {
        this.resetForm();
        this.error = null;
      }, error => {
        this.error = 'Atleast one of the field has error !!';
        console.log(error)
      })
      
    } else {
      console.log('Child task')
      this.addTaskModel = this.taskForm.value;
      this.addTaskModel.project = this.selectedProject?this.selectedProject.split('-')[1].trim():null;
      this.addTaskModel.projectId = this.selectedProject?+this.selectedProject.split('-')[0].trim():null;
      this.addTaskModel.userId = this.selectedUser?+this.selectedUser.split('-')[0].trim():null;
      this.addTaskModel.user = this.selectedUser? this.selectedUser.split('-')[1].trim():null;
      this.addTaskModel.parentId = this.selectedParent ? +this.selectedParent.split('-')[0].trim() : null;
      this.addTaskModel.parentTask = this.selectedParent ? this.selectedParent.split('-')[1].trim() : null;
     
      console.log(this.addTaskModel);
      this.taskService.addTask(this.addTaskModel).subscribe(data => {
        console.log(this.addTaskModel);
        this.resetForm();
        this.error = null;
      }, error => {
        this.error = 'Atleast one of the field has error !!';
        console.log(error);
      });
    }
    
  }
  onUpdate(){
    this.addTask = this.taskForm.value;
    if(+this.selectedParent.includes('-')){
      this.addTask.parentId = this.selectedParent?+this.selectedParent.split('-')[0].trim():null ;
      this.addTask.parentTask = this.selectedParent?this.selectedParent.split('-')[1].trim():null ;
    }else{
      this.addTask.parentId = +this.selectedParent ;
    }
    
    this.addTask.projectId = this.selectedProject?+this.selectedProject.split('-')[0].trim():null;
    this.addTask.userId = this.selectedUser?+this.selectedUser.split('-')[0].trim():null;
    this.addTask.taskId = this.wstaskId;
    console.log('this is the task we are gonna edit' + this.editTask);
    this.taskService.editTask(this.addTask).subscribe(data => {
      this.resetForm();
      this.error = null;
    }, error => {
      this.error = 'Atleast one of the field has error !!';
      console.log(error);
    });
    if(this.selectedUser !== this.oldUser) {
      console.log('this is our  new user update' + this.addTask.userId);
      this.userService.getuser(this.addTask.userId).subscribe(data => {
        data.taskId = this.wstaskId;
        this.editUser = data;
        console.log(this.editUser);
        this.userService.updateuser(this.editUser).subscribe(updatedusr => {
          console.log('user edited!!!!!!!!!!!!!!!');
        }, error => {
          this.error = 'error updating user after editing task!!';
          console.log(error);
        });
      }, error => {
          this.error = 'error getting user after editing task!!';
          console.log(error);
      });
      console.log('this is to untag old user to task' + this.oldUserId);
      this.userService.getuser(this.oldUserId).subscribe(data => {
        data.taskId = 0;
        this.editUser = data;
        console.log(this.editUser);
        this.userService.updateuser(this.editUser).subscribe(updatedusr => {
          console.log('old user edited!!!!!!!!!!!!!!!');
        }, error => {
          this.error = 'error updating old user after editing task!!';
          console.log(error);
        });
      }, error => {
        this.error = 'error getting user after editing task!!';
        console.log(error);
      })
    }
    this.router.navigate(['/view-task']);
        this.taskService.getAllTasks()
        .subscribe(tasks => {
          this.tasks = tasks;
          this.filteredTasks = this.tasks;
        })
  }
  cancelEdit() {
    this.router.navigate(['/view-task'])
  }
  getParentTasks(id) {
    this.taskService.getParentTask().subscribe(data => {
      this.parentsList = data;
      console.log(this.parentsList);
      console.log('this is our parent list' + this.parentsList);
      $('#ProjectModal').modal('hide');
    }, error => {
      console.log(error);
    })
  }

  saveProject() {
    this.clearParent();
    let temp = this.selectedProject.split('-')
    console.log(temp);
    this.taskForm.patchValue({
      'project': temp[1].trim()
    });
    this.getParentTasks(temp[0]);
    console.log('this is the task id' + temp[0]);
  }
  clearParent() {
    this.selectedParent = null;
    this.searchParent = null;
    this.taskForm.patchValue({
      parentTask: null
    });
  }
  saveParent() {
    let temp = this.selectedParent.split('-')
    this.taskForm.patchValue({
      "parentTask": temp[1].trim()
    });
    $('#ParentModal').modal('hide');
  }

  saveUser() {
    let temp = this.selectedUser.split('-')
    this.taskForm.patchValue({
      "user": temp[1].trim()
    });
    $('#UserModal').modal('hide');
  }

  cancelTask(task: Task): void{
    this.taskService.task = task;
    this.router.navigate(['/view']);
  }

  editTask(task : Task): void {
    this.taskService.editTask(task).subscribe();
    this.editTaskFlag = false;
    window.alert('Task Updated Successfully!!!');
    this.router.navigate(['/view']);
  }

  changeEvent(event: boolean): void{
    this.disable = event;
  }

  getParentTask(): void{
    this.taskService.getParentTask()
    .subscribe(parentTasks => this.parentTasks = parentTasks)
  }
  resetForm() {
    this.error = null;
    this.searchProject = null;
    this.selectedProject = null;
    this.searchParent = null;
    this.selectedParent = null;
    this.searchUser = null;
    this.selectedUser = null;
    this.editable = false;
    this.taskForm.reset({
      priority: 0,
      parentTaskFlag: false,
      startDate: this.today,
      endDate: this.tomorrow
    });
    this.taskForm.get('priority').enable();
    this.taskForm.get('startDate').enable();
    this.taskForm.get('endDate').enable();
    this.taskForm.get('parentTaskFlag').enable();
  }

  formStatusValid() {
    if (this.taskForm.get('parentTaskFlag').value == 'true') {
      return !this.taskForm.valid || this.taskForm.get('project').value;
    } else {
      return !this.taskForm.valid ||
        !this.taskForm.get('project').value || this.taskForm.get('parentTask').value ||
        !this.taskForm.get('user').value;
    }
  }
}
