import {Doc} from './doc';

export class SystemDoc extends Doc {
  public symbolicName: string;
  public parent: string;

  constructor(json: any) {
    super(json);
    this.symbolicName = json.symbolicName;
    this.parent = json.parent;
  }

}
