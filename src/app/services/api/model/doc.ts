export class Doc {
  public title: string;
  public id: string;
  public author: string;
  public description: string;
  public type: string;
  public baseType: string;
  public data: any;
  public fileName: string;
  public fileLength: number;
  public lastModified: Date;
  public creationTime: Date;
  public acl: string[];
  public versionSeries: string;
  public docVersion: string;
  public lastVersion: boolean;

  constructor(json: any) {
    this.title = (json.title || null);
    this.id = (json.id || json.uuid || null);
    this.author = (json.author || null);
    this.description = (json.description || null);
    this.type = (json.type || null);
    this.baseType = (json.baseType || null);
    this.data = (json.data || null);
    this.fileName = (json.fileName || null);
    this.fileLength = (json.fileLength || null);
    this.creationTime = new Date(json.creationTime);
    this.lastModified = new Date(json.modificationTime);
    this.acl = (json.acl || []);
    this.docVersion = json.docVersion;
    this.versionSeries = json.versionSeries || json.uuid;
    this.lastVersion = json.lastVersion;
  }
}
