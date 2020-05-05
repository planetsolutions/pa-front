import {Token} from './token';

export class UserLocalInfo {

  static deserialize(serialization: string): UserLocalInfo {
    const json = JSON.parse(serialization);
    const token = Token.fromJson(json.token);

    return new UserLocalInfo(token, json.username);
  }

  constructor(public token: Token, public username: string) { }

  public serialize(): string {
    return JSON.stringify(this);
  }
}
