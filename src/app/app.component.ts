import {Component} from '@angular/core';
import {ApiService} from './services/api/api.service';
import {UserInfo, ThemeInfo} from './index';
import {TranslateService} from '@ngx-translate/core';
import {CommunicationService} from './services/communication.service';
import {Observable} from 'rxjs/Observable';
import {AlertsService} from './alerts/alerts.service';
import {environment} from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public username: string = null;
  public fullName: string = null;
  public roles: string[] = [];
  public siteTitle: string;
  public siteLogo: string;

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
              this.commService.set('groups', userInfo.groups);
            }

          });
      }
    });

    apiService.getTheme().subscribe((info) => {
      this.changeTheme(info);
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

  private changeTheme(info: ThemeInfo): void {
    if (info.styleSheet) {
      if (info.styleSheet.indexOf('.css') < 0) {
        window.document.getElementById('css_theme').setAttribute('href', `assets/themes/${info.styleSheet}.css`);
      } else {
        window.document.getElementById('css_theme').setAttribute('href', info.styleSheet);
      }
    } else {
      window.document.getElementById('css_theme').removeAttribute('href');
    }

    if (info.siteTitle) {
      this.siteTitle = info.siteTitle;
      window.document.title = info.siteTitle;
    } else {
      this.translate.get('title').subscribe((val: string) => {
        this.siteTitle = val;
        window.document.title = val;
      });
    }

    if (info.logo) {
      this.siteLogo = info.logo;
    } else {
      this.siteLogo = environment.logo;
    }

    if (info.favicon) {
       window.document.getElementById('favicon').setAttribute('href', info.favicon);
    }
  }
}
