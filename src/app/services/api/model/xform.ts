import {HalLinkedObject} from './hal-links';
export class XForm extends HalLinkedObject {
  public form: string;
  public version: number;
  public searchName: string;
  public compositionName: string;
  public searchData: any;

  constructor(json: {_links: [any],
                      form: string,
                      version: number,
                      searchName: string,
                      compositionName: string,
                      searchData?: any
  }) {
    super(json);

    this.form = json.form;
    this.version = json.version;
    this.searchName = json.searchName;
    this.compositionName = json.compositionName;
    this.searchData = json.searchData;
  }
}
