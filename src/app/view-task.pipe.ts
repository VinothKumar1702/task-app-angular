import { Pipe, PipeTransform } from '@angular/core';
import { Task } from './shared/taskshared/task.model';

@Pipe(
{ name: 'category'}
)

export class CategoryPipe implements PipeTransform {
    transform(tasks: any[], searchText: string): any {
        if (!tasks) {return [];}
        if (!searchText) {return tasks;}
        searchText = searchText.toLowerCase();
        return tasks.filter(task => {
          return (task.startDate.toLowerCase().includes(searchText) ||
          task.endDate.toLowerCase().includes(searchText) ||
            (task.priority).includes(searchText)
          );
        });
      }
    
}