import { Component, OnInit } from '@angular/core';

import { TaskService } from '../shared/taskshared/task.service';

import { Task } from '../shared/taskshared/task.model';

import { ParentTask } from '../shared/taskshared/parent-task.model'
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-add-task',
  templateUrl: './add-task.component.html',
  styleUrls: ['./add-task.component.css']
})
export class AddTaskComponent implements OnInit {


  parentTasks: ParentTask[]=[];
  task: Object = {};

  disable: boolean = false;
  editTaskFlag : boolean = false;
  value: string;
  

  constructor(private taskService: TaskService,private router:Router, route:ActivatedRoute) { 
    
    if(this.taskService.task != null){
      this.task = this.taskService.task;
      this.taskService.task = null;
      this.editTaskFlag = this.taskService.editTaskFlag;
      this.taskService.editTaskFlag = false;
    }
  }

  ngOnInit() {
   
      this.getParentTask();
  }
 

  addTask(task: Task): void {
   
    this.taskService.addTask(task).subscribe();
    window.alert('Task Added Successfully!!!');
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
}
