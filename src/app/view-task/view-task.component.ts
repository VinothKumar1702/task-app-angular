import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';

import { Task } from '../shared/taskshared/task.model';

import { TaskService } from '../shared/taskshared/task.service';
import { CategoryPipe } from '../view-task.pipe';


@Component({
  selector: 'app-view-task',
  templateUrl: './view-task.component.html',
  styleUrls: ['./view-task.component.css'],
  providers: [CategoryPipe]
})
export class ViewTaskComponent implements OnInit {
  

  tasks: Task[]=[];
  filteredTasks: Task[];
  search:String;

  constructor(private taskService: TaskService,private router:Router, private filterTaskPipe: CategoryPipe) { 
    this.getAllTask();
  }

  ngOnInit() {
  
  }

  getAllTask():void{
    this.taskService.getAllTasks()
    .subscribe(tasks => {
      this.tasks = tasks;
      this.filteredTasks = this.tasks;
    })
  }
  
  editTask(task: Task): void{
    this.taskService.task = task;
    this.taskService.editTaskFlag = true;
    this.router.navigate(['/add-task']);
  }

  deleteTask(taskId: number,i:number): void {
   
    this.taskService.deleteTask(taskId).subscribe();
    this.tasks.splice(i, 1);
    window.alert('Task Ended Successfully!!!');
  }
  
  sort(basis){
    // sort by employeeId
    if (basis === 'startDate') {
      this.filteredTasks.sort((a, b) => {
        const nameA = a.startDate.toUpperCase();
        const nameB = b.startDate.toUpperCase();
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      });
    } else if (basis === 'endDate') {
      // sort by end date
      this.filteredTasks.sort((a, b) => {
        const nameA = a.endDate.toUpperCase();
        const nameB = b.endDate.toUpperCase();
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      });
    } else if(basis === 'priority'){
      // sort by priority
      this.filteredTasks.sort((a, b) => {
        return +a.priority - +b.priority;
      });
    }
  }
  
  onSearch(text) {
    this.filteredTasks = this.filterTaskPipe.transform(this.tasks, text);
  }

}
