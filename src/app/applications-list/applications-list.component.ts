import { Component, OnInit } from '@angular/core';
import {Application} from '../index';
import {ApiService} from '../services/api/api.service';

@Component({
  selector: 'app-applications-list',
  templateUrl: './applications-list.component.html',
  styleUrls: ['./applications-list.component.css'],
})
export class ApplicationsListComponent implements OnInit {
  applications: Application[] = [];

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.apiService.getApplications().subscribe((app: Application) => {

      this.applications.push(app);
    });
  }

}
