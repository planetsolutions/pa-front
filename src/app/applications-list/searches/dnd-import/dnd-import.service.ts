import { Injectable } from '@angular/core';
import {ApiService} from '../../../services/api/api.service';
import {Observable} from 'rxjs/Observable';
import {AlertsService} from '../../../alerts/alerts.service';
import {CmisObject, Doc} from '../../../index';

// import {FileSystemEntry, FileSystemDirectoryReader, FileSystemFileEntry, FileSystemDirectoryEntry} from 'filesystem';

@Injectable()
export class DNDImportService {
  filesDone = 0;
  docType: string;

  constructor(private apiService: ApiService, private alertService: AlertsService) {

  }

  public uploadFiles(dataTransfer: DataTransfer, parentFolderId: string, docType: string): Observable<any>  {
    this.filesDone = 0;
    this.docType = docType;
    let entriesDone = 0;
    const entriesTotal = dataTransfer.items.length;
    console.log('total top entries to upload: ' + entriesTotal);

    return Observable.create(observer => {
      for (let i = 0; i < entriesTotal; i++) {
        const item = dataTransfer.items[i];
        if (item.kind === 'file') {
          if (typeof item.webkitGetAsEntry === 'function') {
            this.readEntry(item.webkitGetAsEntry(), parentFolderId).then((entryName: string) => {
              entriesDone++;
              console.log('entry done:' + entryName + '; entries done ' + entriesDone);
              if ( (entriesTotal - entriesDone) === 0) {
                console.log('total files =' + this.filesDone);
                observer.next(this.filesDone);
                observer.complete();
              }
            });
          } else {
            console.log('getAsFile');
          }
        }
      }
    });
  }

  private readEntry(entry: any, parent: string): Promise<any> {
    if (this.isFile(entry)) {
      return new Promise((resolve) => {
        entry.file(file => {
          this.uploadFile(file, parent).subscribe((res: CmisObject) => {
            console.log('doc created ' + res.id + ' in ' + parent);
            this.filesDone ++;
            resolve(file.name);
          });
        });
      });
    } else if (this.isDirectory(entry)) {
      const folder = entry;
      return new Promise((resolve) => {
        this.createFolder(folder, parent).subscribe((res: CmisObject) => {
          console.log('folder created ' + res.id + ' in ' + parent);
          this.readFolderContent(folder.createReader(), res.id).then((entriesCount) => {
            resolve(folder.name);
          });
        });
      });
    }
  }

  private readFolderContent(reader: any, parent: string): Promise<any> {
    const that = this;
    return new Promise((resolve) => {
      reader.readEntries(function (entries) {

        let entriesDone = 0;
        const entriesTotal = entries.length;

        console.log('reading folder entries: ' + entriesTotal);
		if (entriesTotal == 0) {
			resolve(entriesDone);
		} else {
			for (const entry of entries) {
			  that.readEntry(entry, parent).then((entryName: string) => {
				entriesDone ++;
				if ( (entriesTotal - entriesDone) === 0) {
				  console.log('folder contents done=' + entriesTotal);
				  resolve(entriesDone);
				}
			  });
			}
		}
      });
    });
  }

  private uploadFile(file: any, parent: string): Observable<any> {

    const doc = new Doc({});
    doc.type = this.docType;
    doc.title = file.name;
    doc.description = 'DND uploaded file';
    return this.apiService.saveDocument(doc, parent, file);
  }

  private createFolder(folder: any, parent: string): Observable<any> {

    const obj = new CmisObject({});
    obj.name = folder.name;
    obj.type = 'cmis:folder';
    return this.apiService.saveFolder(obj, parent);
  }

  private isDirectory(entry: any) {
    return entry.isDirectory;
  }

  private isFile(entry: any) {
    return entry.isFile;
  }
}
