import {Component, Input, OnInit} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Doc} from '../../index';

@Component({
  selector: 'app-folder-edit',
  templateUrl: './folder-edit.component.html'
})
export class FolderEditComponent implements OnInit {

  @Input()  public folderId: string;

  folder: Doc;

  constructor() { }

  ngOnInit() {
  }

  submit(): Observable<string> {

    return this.saveDoc();

  }

  private saveDoc(): Observable<string> {
    return Observable.of('');
  }

}
