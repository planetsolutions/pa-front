export class Aip {
  public name: string;
  public aipId: string;

  constructor(json: any) {
    this.name = json.name;
    this.aipId = json.aipId;
  }
}

