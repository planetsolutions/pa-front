export class ContentData {
  public mimeType: string;
  public url?: string;
  public blob?: Blob;
  public fileName?: string

  constructor(fileName: string) {
    this.fileName = fileName;
  }
}
