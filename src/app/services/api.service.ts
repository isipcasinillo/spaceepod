import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { api_url } from '../api/api';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http:HttpClient) { }



  fetchApi(currentDate: string): Observable<Object> {
    // return this.http.get(api_url + currentDate)
    // return this.http.get(`http://localhost:3000/api/${currentDate}`)
    return this.http.get(`/api/${currentDate}`)
  }
}
