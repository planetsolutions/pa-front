import {Injectable, Injector} from '@angular/core';
import {Token} from '../../index';
import {Observable} from 'rxjs/Observable';
import {ApiService} from './api.service';

@Injectable()
export class AuthService {

  private _authToken: Token;
  private _userName: string;
  private LOCAL_STORAGE_TOKEN_KEY = 'auth_token';
  private LOCAL_STORAGE_USER_KEY = 'auth_user';
  private LOCAL_STORAGE_HIDDEN_COL_KEY = 'hidden_columns';
  private LOCAL_STORAGE_PAGE_SIZE = 'page_size';
  private LOCAL_STORAGE_AUTO_REFRESH = 'auto_refresh';

  constructor(private inj: Injector) {
    const storedToken = window.localStorage.getItem(this.LOCAL_STORAGE_TOKEN_KEY);
    const storedUser = window.localStorage.getItem(this.LOCAL_STORAGE_USER_KEY);
    if (storedToken && storedToken !== '') {
      this._authToken = Token.fromJson(JSON.parse(storedToken));
      if (storedUser && storedUser !== '') {
        this._userName = storedUser;
      }
    }
  }

  public setAuthToken(value: Token): void {
    this._authToken = value;
    this.saveToken();
  }

  public getAuthToken(): Token {
    return this._authToken;
  }

  public getUserName(): string {
    return this._userName;
  }

  public setUserName(value: string) {
    this._userName = value;
    if (value) {
      window.localStorage.setItem(this.LOCAL_STORAGE_USER_KEY, value);
    } else {
      window.localStorage.removeItem(this.LOCAL_STORAGE_USER_KEY);
    }
  }

  public refreshToken(): Observable<Token> {
    console.log('trying to refresh token');
    const token = this.getAuthToken();
    if (!token || !token.refreshToken || token.refreshToken === '') {
      console.log('refresh token missing');
      return Observable.of(null);
    }

    return this.inj.get(ApiService).refreshToken(token.refreshToken)
      .map((newToken: string) => {
        this._authToken.accessToken = newToken;
        this.saveToken();
        return this._authToken;
      })
      .catch(error => Observable.of(null));
  }

  public setHiddenColumns(value: any) {
    if (value) {
      window.localStorage.setItem(this.LOCAL_STORAGE_HIDDEN_COL_KEY + this._userName, JSON.stringify(value));
    } else {
      window.localStorage.removeItem(this.LOCAL_STORAGE_HIDDEN_COL_KEY + this._userName);
    }
  }

  public getHiddenColumns() {
    const value = window.localStorage.getItem(this.LOCAL_STORAGE_HIDDEN_COL_KEY + this._userName);
    if (value && value !== '') {
      return JSON.parse(value);
    } else {
      return {};
    }
  }

  public setPageSize(value: any) {
    window.localStorage.setItem(this.LOCAL_STORAGE_PAGE_SIZE + this._userName, value);
  }

  public getPageSize(): number {
    const v = window.localStorage.getItem(this.LOCAL_STORAGE_PAGE_SIZE + this._userName);
    return v ? +v : 0;
  }

  public setAutoRefresh(value: any) {
    window.localStorage.setItem(this.LOCAL_STORAGE_AUTO_REFRESH + this._userName, value);
  }

  public getAutoRefresh(): number {
    const v = window.localStorage.getItem(this.LOCAL_STORAGE_AUTO_REFRESH + this._userName);
    return v ? +v : 0;
  }

  private saveToken(): void {
    if (this._authToken) {
      window.localStorage.setItem(this.LOCAL_STORAGE_TOKEN_KEY, JSON.stringify(this._authToken));
    } else {
      window.localStorage.removeItem(this.LOCAL_STORAGE_TOKEN_KEY);
    }
  }



}
