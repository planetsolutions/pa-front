export class AccessGroup {
  public id: string;
  public title: string;

  constructor(json: any) {
    this.id = json.id;
    this.title = json.title;
  }

}
