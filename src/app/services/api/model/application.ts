import {HalLinkedObject} from './hal-links';
import {Platforms} from './platforms.enum';

export class Application extends HalLinkedObject {
  public name: string;
  public createdBy?: string;
  public description?: string;
  public uuid: string;
  public icon: string;
  public platform: Platforms;
  public createTypes: string[];
  public useFTSearch = 'enabled';

  constructor(json: any) {
    super(json);

    this.name = json.name;
    this.createdBy = json.createdBy;
    this.description = json.description;

    if (json.platform && json.platform === 'PG') {
      this.platform = Platforms.PG;
    } else {
      this.platform = Platforms.IA;
    }
    if (json.appData && json.appData.create_types) {
      this.createTypes = json.appData.create_types;
    } else {
      this.createTypes = [];
    }
    if (json.appData && json.appData.icon) {
      this.icon = json.appData.icon;
    }
    if (json.appData && json.appData.fulltext_search) {
      if (json.appData.fulltext_search === 'disabled') {
        this.useFTSearch = null;
      } else {
        this.useFTSearch = json.appData.fulltext_search;
      }
    }
  }
}
