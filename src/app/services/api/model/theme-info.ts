export class ThemeInfo {

  public siteTitle: string;
  public logo: string;
  public styleSheet: string;
  public favicon: string;

  constructor(json: any) {
    this.siteTitle = json.siteTitle;
    this.logo = json.logo;
    this.styleSheet = json.styleSheet;
    this.favicon = json.favicon;
  }

}
