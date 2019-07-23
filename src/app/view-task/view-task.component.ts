import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';

import { Task } from '../shared/taskshared/task.model';

import { TaskService } from '../shared/taskshared/task.service';
import { CategoryPipe } from '../view-task.pipe';
import { ProjectService } from '../shared/taskshared/project.service';
import { Project } from '../shared/taskshared/project.model';

declare var $: any;
@Component({
  selector: 'app-view-task',
  templateUrl: './view-task.component.html',
  styleUrls: ['./view-task.component.css'],
  providers: [CategoryPipe,ProjectService]
})
export class ViewTaskComponent implements OnInit {
  

  tasks: Task[]=[];
  filteredTasks: Task[];
  searchProject: string;
  selectedProject: string;
  project: string;
  projects: Project[];

  constructor(private taskService: TaskService,private router:Router, private filterTaskPipe: CategoryPipe,
    private projectService: ProjectService) { 
    this.getAllTask();
  }

  ngOnInit() {
      this.projectService.getProjects().subscribe(data => {
        this.projects = data;
      }, error => {
        console.log(error);
      });
  }

  saveProject() {
    const temp = this.selectedProject.split('-');
    this.project = temp[1];
    this.getTasksByProjectId(+temp[0]);
    $('#ProjectModal').modal('hide');
  }
  getTasksByProjectId(projectId: number) {
    this.taskService.getTasksByProjectId(projectId).subscribe(tasks=>{
      this.filteredTasks = tasks;
    })

  }
  clearFilter() {
    this.project=null;
    this.getAllTask();
  }
  getAllTask():void{
    this.taskService.getAllTasks()
    .subscribe(tasks => {
      this.tasks = tasks;
      this.filteredTasks = this.tasks;
    })
  }
  
  endTask(taskId: number,i:number): void {
    this.taskService.endTask(taskId).subscribe();
    location.reload();
  }
  
  sort(basis){
    // sort by startDate
    if (basis === 'startDate') {
      this.filteredTasks.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    } else if (basis === 'endDate') {
      this.filteredTasks.sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
    } else if(basis === 'completed'){
      this.filteredTasks.sort((a, b) => {        
        const nameA = a.completed.toUpperCase();
        const nameB = b.completed.toUpperCase();
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      });
    }
    else if(basis === 'priority'){
      // sort by priority
      this.filteredTasks.sort((a, b) => {
        return +a.priority - +b.priority;
      });
    }
  }
  
  editTask(id) {
    this.router.navigate(['/add-task'], {
      queryParams: {
        taskId: id
      }
    });
  }

  onSearch(text) {
    this.filteredTasks = this.filterTaskPipe.transform(this.tasks, text);
  }

}
