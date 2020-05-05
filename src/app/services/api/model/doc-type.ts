export class DocType {
  public title: string;
  public id: string;
  public author: string;
  public parent: string;
  public symbolicName: string;
  public storagePolicy: string;
  public retentionPolicy: string;
  public access: any;
  public audit: any;
  public optionalTabs: string[] = [];
  public schema: any;
  public datasource: string;
  public properties: {name: string, type: string, title: string, isRequired: boolean}[];

  constructor(json: any) {
    if (json) {
      this.id = json.id ? json.id + '' : null;
      this.author = json.author;
      this.title = json.title;
      this.symbolicName = json.symbolicName;
      this.parent = json.parent;

      if (json.data) {
        this.storagePolicy = json.data.storage_policy;
        this.retentionPolicy = json.data.retention_policy;
        this.access = json.data.access || null;
        this.audit = json.data.audit || null;
        this.optionalTabs = json.data.optionalTabs || [];
        this.datasource = json.data.datasource;
        this.properties = json.data.properties;
        if (json.data.schema) {
          this.schema = json.data.schema;
        }
      }
    }
  }
}
