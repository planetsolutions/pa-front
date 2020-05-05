import {Component} from '@angular/core';
import {ApiService} from './services/api/api.service';
import {UserInfo} from './index';
import {TranslateService} from '@ngx-translate/core';
import {CommunicationService} from './services/communication.service';
import {Observable} from 'rxjs/Observable';
import {AlertsService} from './alerts/alerts.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public username: string = null;
  public fullName: string = null;
  public roles: string[] = [];

  constructor(private apiService: ApiService, private translate: TranslateService, private commService: CommunicationService, private alertsService: AlertsService) {
    apiService.getUsername()
      .subscribe((name) => {
      this.username = name;
      if (this.username) {
        apiService.getUserInfo()
          .subscribe((userInfo: UserInfo) => {
            if (userInfo) {
              if (userInfo.fullName && userInfo.fullName !== '') {
                const arr = userInfo.fullName.split(' ');
                if (arr.length < 2) {
                  this.fullName = userInfo.fullName;
                } else if (arr.length === 2) {
                  this.fullName = arr[0] + ' ' + arr[1].substr(0, 1) + '.';
                } else {
                  this.fullName = arr[0] + ' ' + arr[1].substr(0, 1) + '.' + ' ' + arr[2].substr(0, 1) + '.';
                }
              }

              this.roles = userInfo.roles;
              this.commService.set('roles', userInfo.roles);
            }

            this.translate.get('title').subscribe((val: string) => {
              window.document.title = val;
            });
          });
      }
    });

  }

  public logout() {
    this.apiService.logout();
    this.username = null;
    this.roles = [];
    this.fullName = null;
  }

  public hasRole(rolesToCheck: string[]) {
    for (let i = 0; i < rolesToCheck.length; i ++) {
      if (this.roles.indexOf(rolesToCheck[i]) > -1) {
        return true;
      }
    }
    return false;
  }

  public about() {

    Observable.forkJoin(this.apiService.getVersionFront(), this.apiService.getVersionBackend())
      .subscribe((result: [any, any]) => {
        this.alertsService.info({
          text: 'Frontend: ' + result[0].version + '\n \n Backend: ' + result[1].version,
          title: 'nav.about'
        })
      })
  }
}
