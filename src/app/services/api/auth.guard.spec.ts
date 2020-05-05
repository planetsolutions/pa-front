import { TestBed, async, inject } from '@angular/core/testing';

import { AuthGuard } from './auth.guard';
import {ApiService} from './api.service';
import {Http} from '@angular/http';


describe('AuthGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthGuard, ApiService, Http]
    });
  });

  // it('should ...', inject([AuthGuard, ApiService, Http], (guard: AuthGuard) => {
  //   expect(guard).toBeTruthy();
  // }));
});
