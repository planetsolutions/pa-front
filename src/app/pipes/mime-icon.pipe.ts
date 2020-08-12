import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mimeIcon'
})
export class MimeIconPipe implements PipeTransform {

  private supported = [
    '3g2', '3gp',
    'ai', 'air', 'asf', 'avi',
    'bib',
    'cls', 'csv',
    'deb', 'djvu', 'dmg', 'doc', 'docx', 'dwf', 'dwg',
    'eps', 'epub', 'exe',
    'f', 'f77', 'f90', 'flac', 'flv',
    'gif', 'gz',
    'ico', 'indd', 'iso',
    'jpg', 'jpeg',
    'key',
    'log',
    'm4a', 'm4v', 'midi', 'mkv', 'mov', 'mp3', 'mp4', 'mpeg', 'mpg', 'msi',
    'odp', 'ods', 'odt', 'oga', 'ogg', 'ogv',
    'pdf', 'png', 'pps', 'ppsx', 'ppt', 'pptx', 'psd', 'pub', 'py',
    'qt',
    'ra', 'ram', 'rar', 'rm', 'rpm', 'rtf', 'rv',
    'skp', 'spx', 'sql', 'sty',
    'tar', 'tex', 'tgz', 'tiff', 'ttf', 'txt',
    'vob',
    'wav', 'wmv',
    'xls', 'xlsx', 'xml', 'xpi',
    'zip'
  ];

  transform(filename: string, size: number = 24 ): string {
    let img = null;

    if (filename && filename.indexOf && filename.indexOf('.') > -1 ) {
      const ext = filename.substr(filename.lastIndexOf('.') + 1).toLowerCase();
      if (this.supported.indexOf(ext) > -1) {
        img = ext;
      }
    }

    if (img) {
      return `<img src="assets/mime/${img}-icon-${size}x${size}.png" width="${size}" height="${size}" border="0" alt="${img}" title="${img}">`;
    } else {
      if (filename === 'empty') {
        return '<span class="mdi  mdi-file-hidden mdi-24px"></span>';
      } else if (filename === 'folder' || 'cmis:folder') {
        return '<span class="mdi  mdi-folder mdi-24px color-grey"></span>';
      } else {
        return '<span class="mdi  mdi-file-question mdi-24px"></span>';
      }
    }
  }

}
