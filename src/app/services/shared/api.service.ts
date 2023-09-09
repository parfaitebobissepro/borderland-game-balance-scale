import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient, HttpParams, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
// import { environment } from 'environment';
import { environment } from 'environmentprod';


@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  private formatErrors(error: HttpErrorResponse) {
    return throwError(() => error.error);
  }

  get(path: string, params: HttpParams = new HttpParams()): Observable<any> {
    return this.http.get(`${environment.api_url}${path}`, { params })
      .pipe(catchError(this.formatErrors));
  }

  put(path: string, body: Object = {}): Observable<any> {
    return this.http.put(
      `${environment.api_url}${path}`,
      JSON.stringify(body)
    ).pipe(catchError(this.formatErrors));
  }

  post(path: string, body: Object = {}): Observable<any> {
    return this.http.post(
      `${environment.api_url}${path}`,
      JSON.stringify(body)
    ).pipe(catchError(this.formatErrors));
  }
  patch(path: string, body: Object = {}): Observable<any> {
    return this.http.patch(
      `${environment.api_url}${path}`,
      JSON.stringify(body)
    ).pipe(catchError(this.formatErrors));
  }
  delete(path: string, body: Object = {}): Observable<any> {
    return this.http.request('DELETE', `${environment.api_url}${path}`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify(body)
    }).pipe(catchError(this.formatErrors));

  }


  //Files
  postFile(path: string, formData: FormData): Observable<any> {
    const header = new HttpHeaders();
    const params = new HttpParams();
    const req = new HttpRequest('POST', `${environment.api_url}${path}`, formData);
    return this.http.request(req);
  }

  downloadFile(path: string, params: HttpParams = new HttpParams()): Observable<any> {
    return this.http.get(`${environment.api_url}${path}`, {
      responseType: 'blob'
    })
      .pipe(map((res: any) => {
        const blob = new Blob([res]);
        return blob;
      })
      );
  }


}
