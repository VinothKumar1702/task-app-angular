import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';

import { Task } from '../shared/taskshared/task.model';

import { TaskService } from '../shared/taskshared/task.service';


@Component({
  selector: 'app-view-task',
  templateUrl: './view-task.component.html',
  styleUrls: ['./view-task.component.css']
})
export class ViewTaskComponent implements OnInit {
  

  tasks: Task[]=[];

  constructor(private taskService: TaskService,private router:Router) { 
    this.getAllTask();
  }

  ngOnInit() {
  
  }

  getAllTask():void{
    this.taskService.getAllTasks()
    .subscribe(tasks => this.tasks = tasks)
  }

  editTask(task: Task): void{
    this.taskService.task = task;
    this.taskService.editTaskFlag = true;
    this.router.navigate(['/add']);
  }

  deleteTask(taskId: number,i:number): void {
   
    this.taskService.deleteTask(taskId).subscribe();
    this.tasks.splice(i, 1);
    window.alert('Task Ended Successfully!!!');
  }
  


}
