import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { catchError, map, tap } from 'rxjs/operators';

import { Task } from './task.model';
import { ParentTask } from './parent-task.model';


const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};
@Injectable({
  providedIn: 'root'
}) 
export class TaskService {
  
  private taskUrl = window["apiBaseUrl"]+"/task";
  private rootUrl = window["apiBaseUrl"];
  private endTaskUrl = this.taskUrl+"/end";

  public task = null;
  public editTaskFlag = false;

  constructor(private http: HttpClient) { }

  getParentTaskById(parentTaskId:number): Observable<ParentTask>{
	return this.http.get<ParentTask>(this.rootUrl+"/parent-task/view/"+parentTaskId)
      .pipe(
        tap(() => this.log(`fetched ParentTaskById`)),
       catchError(this.handleError<ParentTask>('getParentTaskById'))
      );
  }
  getTaskById(taskId:number): Observable<Task>{
    return this.http.get<Task>(this.taskUrl+"/view/"+taskId)
        .pipe(
          tap(() => this.log(`fetched getTaskById`)),
         catchError(this.handleError<Task>('getTaskById'))
        );
    }
    getTasksByProjectId(projectId:number):Observable<Task[]>{
      return this.http.get<Task[]>(this.rootUrl+"/task/view-by-project/"+projectId)
      .pipe(
        tap(() => this.log(`fetched projectId`)),
       catchError(this.handleError<Task[]>('projectId'))
      );
    }

  addTask(tempTask: Task) : Observable<Task> {
    var addUrl = this.taskUrl + "/add";
    return this.http.post<Task>(addUrl, tempTask, httpOptions).pipe(
      tap(() => this.log(`added task`)),
      catchError(this.handleError<Task>('addTask'))
    );
  }

  endTask (taskId: number): Observable<Task> {
    window.location.hash = String(taskId);
    let params = new HttpParams()
    .set('taskId',  window.location.hash = String(taskId));
    var endUrl = `${this.endTaskUrl}?${params}`;
    return this.http.post<Task>(endUrl,httpOptions).pipe(
      tap(() => this.log(`end task`)),
      catchError(this.handleError<Task>('end'))
    );
  }

  getParentTask(): Observable<ParentTask[]>{
	return this.http.get<ParentTask[]>(this.rootUrl+"/parent-task/view")
      .pipe(
        tap(parentTasks => this.log(`fetched parentTasks`)),
        catchError(this.handleError('getParentTask', []))
      );
  }

  editTask (task: Task): Observable<any> {
    return this.http.put(this.taskUrl + "/update", task, httpOptions).pipe(
      tap(_ => this.log(`updated task`)),
      catchError(this.handleError<any>('updateUser'))
    );
  }

  getAllTasks(): Observable<Task[]>{
	return this.http.get<Task[]>(this.rootUrl+"/task/view")
      .pipe(
        tap(Tasks => this.log(`fetched Tasks`)),
        catchError(this.handleError('getParentTask', []))
      );
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      
      console.error(error);

      
      this.log(`${operation} failed: ${error.message}`);

      
      return of(result as T);
    };

  }

  private log(message: string) {
    //console.log(message);
    
  }
}
