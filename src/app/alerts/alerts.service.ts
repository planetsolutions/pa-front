import { Injectable } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import {Observable} from 'rxjs/Observable';
import {AlertDialogComponent} from './alert-dialog/alert-dialog.component';
import {DomSanitizer} from "@angular/platform-browser";
import {TranslateService} from "@ngx-translate/core";

@Injectable()
export class AlertsService {

  constructor(private modalService: BsModalService, private sanitized: DomSanitizer, private translate: TranslateService) { }

  confirm(params: { text: string, title?: string}): Observable<'yes'|'no'|null> {
    return this.openDialog(params.title || 'title', params.text, 'help', [
      {label: 'actions.yes', theme: 'success', icon: 'ok'},
      {label: 'actions.no', theme: 'default', icon: 'remove'}
    ]).map((btnNum: number) => {
      if (btnNum === 0) {
        return 'yes';
      } else if (btnNum === 1) {
        return 'no';
      } else {
        return null;
      }
    });

  }

  info(params: { text: string, title?: string}): void {
    this.openDialog(params.title || 'title', params.text, 'noicon', [
      {label: 'actions.ok', theme: 'default', icon: 'ok'},
    ], 'md')
  }

  error(params: { error: any, title?: string}): void {

    let text = '';
    let title = params.title || 'error.title';

    if (typeof params.error === 'string') {
      text = params.error;
    } else {
      if (params.error.exception) {
        text = params.error.exception + ': ';
      }
      if (params.error.message) {
        text += params.error.message;
      }

      if (params.error.error) {
        title =  params.error.error;
      }
    }


    this.openDialog(title, text, 'alert-outline', [
      {label: 'actions.ok', theme: 'default', icon: 'ok'}
    ], 'md')
  }

  private openDialog(title: string, text: string, icon: string, buttons: {label: string, theme: string, icon?: string}[], size = 'sm' ): Observable<number> {
    const bsModalRef = this.modalService.show(AlertDialogComponent, {
      animated: false, keyboard: true, backdrop: true, ignoreBackdropClick: true, class: 'modal-' + size
    });
    const formComponent: AlertDialogComponent = (<AlertDialogComponent>bsModalRef.content);

    formComponent.title = title;
    formComponent.text = this.sanitized.bypassSecurityTrustHtml(this.translate.instant(text.split('\n').join('<BR>')));
    formComponent.icon = icon;
    formComponent.buttons = buttons;

    return formComponent.onSubmit.asObservable();
  }

}
