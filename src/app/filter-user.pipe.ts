import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterUser'
})
export class FilterUserPipe implements PipeTransform {

  transform(users: any[], searchText: string): any {
    if (!users) {return [];}
    if (!searchText) {return users;}
    searchText = searchText.toLowerCase();
    return users.filter(user => {
      return (user.firstName.toLowerCase().includes(searchText) ||
        user.lastName.toLowerCase().includes(searchText) ||
        (user.employeeId + "").includes(searchText)
      );
    });
  }

}
