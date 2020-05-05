import {HalLinkedObject} from './hal-links';

export class ResultMaster extends HalLinkedObject {
  public lastModifiedBy: string;
  public lastModifiedDate: string;
  public version: number;
  public compositionName: string;
  public searchName: string;
  public panels: ResultMasterPanel[];
  public namespaces: any[];

  constructor(json: any) {
    super(json);

    this.lastModifiedBy = json.lastModifiedBy;
    this.lastModifiedDate = json.lastModifiedDate;
    this.version = json.version;
    this.compositionName = json.compositionName;
    this.searchName = json.searchName;
    this.panels = json.panels;
    this.namespaces = json.namespaces;
    this.panels = <ResultMasterPanel[]> json.panels;
  }

  public getMainPanel(): ResultMasterPanel {
    return this.getNamedPanel('Main Panel');
  }

  public getSidePanel(): ResultMasterPanel {
    return this.getNamedPanel('Side Panel');
  }

  public getInlinePanel(): ResultMasterPanel {
    return this.getNamedPanel('Inline Panel');
  }

  private getNamedPanel(name: string): ResultMasterPanel {
    for (const panel of this.panels) {
      if (panel.name === name) {
        return panel;
      }
    }

    return null;
  }
}

export interface ResultMasterPanel {
  name?: string;
  title?: string;
  description?: string;
  tabs: ResultMasterPanelTab[];
}

export interface ResultMasterPanelTab {
  name: string;
  title?: string;
  description?: string;
  columns: ResultMasterPanelTabColumn[];
  exportEnabled: boolean;
  createCollectionEnabled: boolean;
  customPresentation?: any;
  exportConfigs?: any[];
}


export interface ResultMasterPanelTabColumn {
  name: string;
  label: string;
  hidden: boolean;
  required: boolean;
  groupName?: string;
  type: string;
  dataType: string;
  link?: boolean;
  sortable?: boolean;
  value?: any;
  faceted?: boolean;
  format?: string
}

export interface SortOptions {
  colName: string | null,
  asc: boolean
}

export namespace ResultMasterColumnTypes {
  export const STRING = 'STRING';
  export const DATETIME = 'DATETIME';
  export const DATE = 'DATE';
  export const NUMBER = 'NUMBER';
  export const ICON = 'ICON';
  export const CONTENT = 'CONTENT';
}
