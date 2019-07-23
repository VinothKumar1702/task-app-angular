
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { User } from './user.model';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) { }

  public user =null;
  
  baseUrl = window["apiBaseUrl"]+'/users/';
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    })
  };

  private handleError(error: HttpErrorResponse) {
    // console.log(error);
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened;' + error.error.message + ' please try again later.');
  }


  addUser(user: User): Observable<User> {
    console.log('in user service');
    console.log(user);
    return this.http.post<User>( this.baseUrl + 'add', JSON.stringify(user), this.httpOptions)
      .pipe(
        tap((user) => console.log('added user')),
        catchError(this.handleError)
      );
  }
  
  private extractData(res: Response) {
    let body = res;
    return body || {};
  }
  // Get all users
  getusers(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl + 'view-all');
  }

  // Get a user
  getuser(userId: number): Observable<User> {
    console.log(' in get user service' + userId);
    window.location.hash = String(userId);
    let params = new HttpParams()
    .set('userId',  window.location.hash = String(userId));
    var url = this.baseUrl+'get';
    var getUrl = `${url}?${params}`;
    return this.http.get<User>(getUrl ,this.httpOptions);

  }
  getuserByProjectId(projectId: number): Observable<User> {
    console.log(' in get user service' + projectId);
    return this.http.get<User>(this.baseUrl + 'getuserbyproject/' + projectId );
  }

  // PUT method to update user
  updateuser(user: User): Observable<User> {
    return this.http.post<User>(this.baseUrl + 'edit', JSON.stringify(user), this.httpOptions).pipe(
      tap(_ => console.log('updated')),
      catchError(this.handleError)
    );
  }

  deleteUser (userId: number): Observable<User> {
    window.location.hash = String(userId);
    let params = new HttpParams()
    .set('userId',  window.location.hash = String(userId));
    var url = this.baseUrl+'delete';
    var deleteUr = `${url}?${params}`;
    return this.http.delete<User>(deleteUr,this.httpOptions).pipe(
      tap(_ => console.log('deleted')),
      catchError(this.handleError)
    );
}
}
