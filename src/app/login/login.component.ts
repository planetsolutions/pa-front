import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {ApiService} from '../services/api/api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public username = '';
  public password = '';
  public loggingIn = false;
  public error: string = null;

  constructor(private apiService: ApiService, private router: Router) { }

  ngOnInit() {
    console.log('Im here');

  }

  submit() {
    this.loggingIn = true;
    this.apiService.login(this.username, this.password).subscribe(
      (result) => {
        if (result) {

          this.router.navigate(['/applications']);
        } else {
          this.error = 'Authentication failed!';
          this.loggingIn = false;
        }
      },
      (error) => {
        if (typeof(error) === 'string') {
          this.error = error;
        } else {
          this.error = error.message || error.text || error.error || error;
        }

        this.loggingIn = false;
      }
    );
  }
}
