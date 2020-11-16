import {Component} from '@angular/core';
import {ObjectsListCellComponent} from './objects-list-cell.component';

@Component({
  selector: 'app-objects-list-tile-cell',
  templateUrl: './objects-list-tile-cell.component.html',
  styleUrls: ['./objects-list-cell.component.css']

})
export class ObjectsListTileCellComponent extends ObjectsListCellComponent {

  public isImage(): boolean {
    return this.mimeType.startsWith('image/')
  }

  public isVideo(): boolean {
    return this.mimeType.startsWith('video/')
  }

  public isPDF(): boolean {
    return this.mimeType === 'application/pdf'
  }
}
