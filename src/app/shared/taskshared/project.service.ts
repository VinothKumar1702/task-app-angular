import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

import { tap, catchError } from 'rxjs/operators';
import { Project } from './project.model';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  })
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  
  baseUrl = 'http://localhost:8081/fse/project';

  constructor(private _http: HttpClient) { }

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

  addProject(project): Observable<Project> {
    return this._http.post<Project>(this.baseUrl + '/add', project, httpOptions);
  }

  updateProject(project): Observable<Project> {
    return this._http.put<Project>(this.baseUrl + '/update', project, httpOptions);
  }

  getProjects(): Observable<Project[]> {
    return this._http.get<Project[]>(this.baseUrl + '/view');
  }

  deleteProject(projectId): Observable<Project> {
    window.location.hash = String(projectId);
    let params = new HttpParams()
    .set('projectId',  window.location.hash = String(projectId));
    var deleteUr = `${this.baseUrl+'/delete'}?${params}`;
    return this._http.delete<Project>(deleteUr,httpOptions);
  }

  getProject(id): Observable<Project> {
    return this._http.get<Project>(this.baseUrl + '/getByProjectId/' + id);
  }

  getProjectByPName(name): Observable<Project> {
    return this._http.get<Project>(this.baseUrl + '/getprojectByPName/' + name);
  }
  getCompletedTasks(id): Observable<any> {
    return this._http.get<any>(this.baseUrl + '/getcompleted/' + id);
  }

  getTotalTasks(id): Observable<any> {
    return this._http.get<any>(this.baseUrl + '/getProjectTasks/' + id);
  }
}
