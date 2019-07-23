import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterParentTask'
})
export class FilterParentTaskPipe implements PipeTransform {

  transform(parents: any[], searchText: string): any {
    if (!parents) {return [];}
    if (!searchText) {return parents;}
    console.log(parents);
    searchText = searchText.toLowerCase();
    return parents.filter(parent => {
      return (parent.parentTaskName.toLowerCase().includes(searchText));
    });
  }

}
