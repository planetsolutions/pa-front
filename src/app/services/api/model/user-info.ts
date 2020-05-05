export class UserInfo {

  public id: string;
  public lang: string;
  public tenantId: string;
  public email: string;
  public fullName: string;
  public groups: string[];
  public roles: string[];

  constructor(json: any) {
    this.id = json.userId;
    this.email = json.email;
    this.fullName = json.fullName;
    this.lang = json.details ? json.details.lang : undefined;
    this.tenantId = json.details ? json.details.tenant : undefined;
    this.groups = [];
    this.roles = [];

    if (json.groups) {
      json.groups.map( (value: string) => this.groups.push(value));
    }
    if (json.userRoleList) {
      json.userRoleList.map( (value: any) => this.roles.push(value.role));
    }
  }

}
