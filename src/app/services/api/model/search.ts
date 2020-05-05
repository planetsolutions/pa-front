import {HalLinkedObject} from './hal-links';
import {IAHal} from './ia-hal';
/**
 * Created by kokora on 5/12/17.
 */

export class Search extends HalLinkedObject {
  public name: string;
  public description?: string;
  public aicUUID: string;

  constructor(json: any) {
    super(json);

    this.name = json.name;
    this.description = json.description;

    this.aicUUID = this.extractLinkElement(IAHal.AIC, -1);
  }
}
