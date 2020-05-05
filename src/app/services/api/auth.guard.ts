import { Injectable } from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { ApiService } from './api.service';

import 'rxjs/add/observable/of';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private apiService: ApiService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    // Ensure we logged in before any routing
    return this.apiService.throwErrorIfNotLoggedIn()
      .flatMap(() => {
        return Observable.of(true);
      })
      .catch(() => {
        this.router.navigate(['/login']);
        return Observable.of(false);
      });
  }
}
