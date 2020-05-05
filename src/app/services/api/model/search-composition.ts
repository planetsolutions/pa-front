import {HalLinkedObject} from './hal-links';
import {IAHal} from './ia-hal';

export class SearchComposition extends HalLinkedObject {
  public searchUUID: string;
  public xformUUID: string;
  public resultMasterUUID: string;

  constructor(json: any) {
    super(json);

    this.searchUUID = this.extractLinkElement(IAHal.SEARCH, -1);
    this.xformUUID = this.extractLinkElement(IAHal.XFORM, -1);
    this.resultMasterUUID = this.extractLinkElement(IAHal.RESULT_MASTER, -1);
  }
}
