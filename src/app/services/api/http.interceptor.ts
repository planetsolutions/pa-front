import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {Router} from '@angular/router';
import {AuthService} from './auth.service';
import {Token} from '../../index';

import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/finally';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/take';
import {Injectable, Injector} from '@angular/core';
import {ApiService} from './api.service';
import {environment} from '../../../environments/environment';

@Injectable()
export class ApiHttpInterceptor implements HttpInterceptor {

  private isRefreshingToken = false;
  tokenSubject: BehaviorSubject<Token> = new BehaviorSubject<Token>(null);

  constructor(private inj: Injector) {
  }

  addToken(req: HttpRequest<any>): HttpRequest<any> {
    const token = this.inj.get(AuthService).getAuthToken();

    if (!req.headers.has('Authorization')) {
      const headers: any = {};
      if (req.url.indexOf('/boot/browser/') > -1 ) { // CMIS
        headers.Authorization = 'Basic Ym9vdDpib290'; // boot
        headers.cmisJwtAuthorization = token.tokenType + ' ' + token.accessToken;
      /*} else if (req.url.indexOf('/boot/') > -1 ) {
        headers.Authorization = 'Basic Ym9vdDpib290'; // boot*/
      } else if (token) {
        headers.Authorization = token.tokenType + ' ' + token.accessToken;
      }
      // console.log('added Authorization header');
      return req.clone({ setHeaders: headers});
    } else {
      console.log('Authorization header exists already');
      return req;
    }
  }

  /**
   * Refresh JWT token
   * @returns {Observable<any>}
   */

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.startsWith('assets/')
      || req.url.startsWith(environment.IAEndpoint + '/login')
      || req.url.indexOf('/token/refresh') > -1
    ) {
      // console.log('bypassed request:');
      // console.log(req);
      return next.handle(req);
    }
    // console.log('intercepted request:');
    // console.log(req);

    return next.handle(this.addToken(req))
      .catch(error  => {
        if (error instanceof HttpErrorResponse) {
          // console.log('http error catched:');
          // console.log(error);
          const err = (<HttpErrorResponse>error);
          switch (err.status) {
            case 400:
              return this.handle400Error(error);
            case 401:
              return this.handle401Error(req, next);
            case 500:
              if (err.error.exception && err.error.exception.indexOf('jsonwebtoken') > -1) {
                return this.handle401Error(req, next);
              }
          }
          return Observable.throw(this.getErrorMessage(error));
        } else {
          return Observable.throw(this.getErrorMessage(error));
        }
      });
  }

  handle401Error(req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    console.log('401 error handler');
    if (!this.isRefreshingToken) {
      this.isRefreshingToken = true;

      // Reset here so that the following requests wait until the token
      // comes back from the refreshToken call.
      this.tokenSubject.next(null);
      const authService = this.inj.get(AuthService);
      return authService.refreshToken()
        .switchMap((newToken: Token) => {
          console.log('got new token');
          if (newToken && newToken.accessToken) {
            this.tokenSubject.next(newToken);
            return next.handle(this.addToken(req));
          } else {
            console.log('new token is bad');
            return this.logoutUser();
          }
        })
        .catch(error => {
          console.log('error while refreshing token');
          return this.logoutUser();
        })
        .finally(() => {
          this.isRefreshingToken = false;
        });
    } else {
      console.log('switch to subject pause');
      return this.tokenSubject
        .filter(token => token != null)
        .take(1)
        .switchMap(token => {
          console.log('resumed subject pause');
          return next.handle(this.addToken(req));
        });
    }
  }

  handle400Error(error): Observable<any> {
    console.log('400 error handler');
    if (error && error.status === 400 && error.error && error.error.error === 'invalid_grant') {
      // If we get a 400 and the error message is 'invalid_grant', the token is no longer valid so logout.
      return this.logoutUser();
    }

    return Observable.throw(this.getErrorMessage(error));
  }

  logoutUser(): Observable<any> {
    console.log('logoutUser');
    this.inj.get(ApiService).logout();
    return Observable.of(null);
  }

  private getErrorMessage(err: any): string {
    let out = 'Server error';
    const error = err.error || err;

    if (error.error || error.message) {
      out = error.code || error.status || 'ERR';
      if (error.message && error.message !== '') {
        out += ': ' + error.message;
      } else if (error.exception && error.exception !== '') {
        out += ': ' + error.exception;
      }
      if (error.validationErrors) {
        error.validationErrors.filter(function(e: any) {
          out += '\n' + (e.errorMessage || e.errorCode || '');
        })
      }
    } else if (error && typeof error === 'string' && error !== '' ) {
      out =  error;
    }
    return out;
  }

}
