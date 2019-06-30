import { Pipe, PipeTransform } from '@angular/core';
import { Task } from './shared/taskshared/task.model';

@Pipe(
{ name: 'category'})
export class CategoryPipe implements PipeTransform {
    transform(tasks: Task[], args?: any): any[] {
   
        if (!args||!tasks) {
            return tasks;
        }

        return tasks.filter(singleItem =>
             singleItem.task.toLowerCase().indexOf(args.toLowerCase())!==-1);
    }
}