import {CmisConstants} from './cmis-constants';

export class CmisObject {
  public name: string;
  public id: string;
  public type: string;
  public baseType: string;
  public hasChildren: boolean;
  public description: string;
  public lastModified: Date;
  public created: Date;
  public data: any;

  constructor(json?: any) {
    if (json) {
      let succinct = false;
      let props = null;
      if (json.object) {
        if (json.object.properties) {
          props = json.object.properties;
        } else if (json.object.succinctProperties) {
          props = json.object.succinctProperties;
          succinct = true;
          this.data = props;
        }
      } else {
        if (json.properties) {
          props = json.properties;
        } else if (json.succinctProperties) {
          props = json.succinctProperties;
          succinct = true;
          this.data = props;
        }
      }
      if (props) {
          this.id = succinct ? props[CmisConstants.CMIS_PROP_ID] : props[CmisConstants.CMIS_PROP_ID].value;
          this.type = succinct ? props[CmisConstants.CMIS_PROP_TYPE] : props[CmisConstants.CMIS_PROP_TYPE].value;
          this.baseType = succinct ? props[CmisConstants.CMIS_PROP_BASETYPE] : props[CmisConstants.CMIS_PROP_BASETYPE].value;
          this.name = succinct ? props[CmisConstants.CMIS_PROP_NAME] : props[CmisConstants.CMIS_PROP_NAME].value;
          this.description = succinct ? props[CmisConstants.CMIS_PROP_DESCR] : props[CmisConstants.CMIS_PROP_DESCR].value;
          this.created = new Date(succinct ? props[CmisConstants.CMIS_PROP_CREATED] : props[CmisConstants.CMIS_PROP_CREATED].value);
          this.lastModified = new Date(succinct ? props[CmisConstants.CMIS_PROP_MODIFIED] : props[CmisConstants.CMIS_PROP_MODIFIED].value);

          this.hasChildren = (this.baseType === CmisConstants.CMIS_TYPE_FOLDER);
      }
    }
  }
}
