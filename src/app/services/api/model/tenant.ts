import {HalLinkedObject} from './hal-links';
import {Platforms} from './platforms.enum';

export class Tenant extends HalLinkedObject {
  public name: string;

  constructor(json: any) {
    super(json);

    this.name = json.name;
  }
}
