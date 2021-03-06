import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { tokenNotExpired } from 'angular2-jwt';

@Injectable()
export class AuthService {

  domain = "http://localhost:8080";
  authToken;
  user;
  options;

  constructor(
    private http: Http
  ) { }

  createAuthenticationHeaders() {
    this.loadToken();
    this.options = new RequestOptions({
      headers: new Headers({
        'Content-Type': 'application/json',
        'authorization': this.authToken
      })
    });
  }

  loadToken() {
    const token = localStorage.getItem('token');
    this.authToken = token;
  }

  registerUser(user) {
    return this.http.post(this.domain + '/authentication/register', user).map(res => res.json());
  }

  login(user) {
    return this.http.post(this.domain + '/authentication/login', user).map(res => res.json());
  }

  logout() {
    this.authToken = null;
    this.user = null;
    localStorage.clear();
  }

  loggedIn() {
    return tokenNotExpired();
  }

  storeUserData(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.authToken = token;
    this.user = user;
  }

  getProfile() {
    this.createAuthenticationHeaders();
    return this.http.get(this.domain + '/authentication/profile', this.options).map(res => res.json());
  }

  getLatestOlderThanTimeStampWithQuery(timeStamp, query) {
    const jsonData = {
      'timestamp': timeStamp,
      'query': query
    }
    return this.http.post(this.domain + '/postalroutes/nextquery', jsonData).map(res => res.json());
  }

  getPostRepliesByParentId(parentId) {
    return this.http.get(this.domain + '/postalroutes/replies/' + parentId).map(res => res.json());
  }

  submitNewPost(newPost) {
    return this.http.post(this.domain + '/postalroutes/newpost', newPost).map(res => res.json());
  }

}
