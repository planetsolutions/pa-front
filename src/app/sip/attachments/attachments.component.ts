import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-attachments',
  templateUrl: './attachments.component.html',
  styleUrls: ['./attachments.component.css']
})
export class AttachmentsComponent implements OnInit {

  @Output() attachmentsChange: EventEmitter<any> = new EventEmitter<any>();

  @Input() attachments = [];

  @Input() public multi = true;

  constructor() { }

  ngOnInit() {
  }

  onChange(event: EventTarget) {
    const eventObj: MSInputMethodContext = <MSInputMethodContext> event;
    const target: HTMLInputElement = <HTMLInputElement> eventObj.target;
    const files: FileList = target.files;

    this.attachments.push(files[0]);
    this.attachmentsChange.emit(this.attachments);
  }

  removeAttachment(att: any) {
    const index = this.attachments.indexOf(att, 0);
    if (index > -1) {
      this.attachments.splice(index, 1);
      this.attachmentsChange.emit(this.attachments);
    }
  }
}
