import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Element} from './model/element';
import * as JSZip from 'jszip';
import * as xmlbuilder from 'xmlbuilder';
import {ApiService} from '../api/api.service';


@Injectable()
export class PdiService {

  constructor(private apiService: ApiService) { }

  buildPdi(structure: Element, xmlns: string, json: any, files: any[]): Observable<any> {
    const pdi = xmlbuilder.create(structure.name, {encoding: 'utf-8'}).att('xmlns', xmlns);
    this.addNode(structure.elements[0], json, pdi, files);
    return Observable.of(pdi.end());
  }

  buildSip(holding: string, xmlns: string): Observable<any> {
    const sip = xmlbuilder.create('sip', {encoding: 'utf-8'}).att('xmlns', 'urn:x-emc:ia-impl:schema:sip:1.0')
      .ele('dss')
      .ele('holding', holding).up()
      .ele('id', '2daf3523-6510-4881-ac05-0a277334fe13').up()
      .ele('pdi_schema', xmlns).up()
      .ele('production_date', '2016-08-09T16:57:35.873+05:30').up()
      .ele('base_retention_date', '2016-08-09T16:57:34.469+05:30').up()
      .ele('producer', holding).up()
      .ele('entity', holding).up()
      .ele('priority', 0).up()
      .ele('application', holding).up()
      .up();

    sip.ele('production_date', '2016-08-09T16:57:35.873+05:30').up()
      .ele('seqno', 1).up()
      .ele('is_last', true).up()
      .ele('aiu_count', 1).up()
      .ele('page_count', 0).up();

    return Observable.of(sip.end());
  }

  public ingest(pdi: string, sip: string, files: Blob[], appUuid: string): Observable<any> {

    const zip = new JSZip();
    zip
      .file('eas_pdi.xml', pdi)
      .file('eas_sip.xml', sip);

    files.forEach(file => {
      const attachment: any = file;
      zip.file(attachment.name, file);
    });

    const promise = zip.generateAsync({
      type: 'blob',
      platform: 'UNIX',
      compression: 'DEFLATE',
      compressionOptions: {level: 9}
    });

    return Observable.fromPromise(promise).flatMap((sip_zip: Blob) => {
      // return Observable.empty();
      // fileSaver.saveAs(sip_zip, 'sip.zip');
      return this.apiService.ingest(appUuid, sip_zip);
    });
  }


  private addNode(element: Element, json: any, pdi: any, files: any[]) {
    if (element === undefined) {
      return;
    }
    if (element.elements.length !== 0) {
      const node = pdi.ele(element.name);
      if (element.name.toLowerCase() === 'attachments') {
        this.addAttachments(element.elements[0], node, files);
      } else {
        length = element.elements.length;
        for (let i = 0; i < length; i++) {
          this.addNode(element.elements[i], json, node, files);
        }
        node.up();
      }
    } else {
      pdi.ele(element.name, json[element.name]).up();
    }
  }

  private addAttachments(element: Element, pdi: any, files: any[]) {
    let node;
    files.forEach(file => {
      node = pdi.ele(element.name);
      node
        .ele('name', file.name).up()
        .ele('size', file.size).up()
        .ele('mediaType', file.type).up()
        .ele('createdBy', 'Creator').up()
        .ele('creationDate', '2016-08-09T16:57:23.329+05:30').up();
      node.up();
    });
  }
}
