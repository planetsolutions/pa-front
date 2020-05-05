import {LoginResponse} from './login-response';
export class Token {
  public accessToken: string;
  public refreshToken: string;
  public tokenType: string;
  public tokenCreated: Date;

  static fromAuthorization(loginResponse: LoginResponse): Token {
    return new Token(loginResponse.accessToken, loginResponse.refreshToken, loginResponse.tokenType);
  }

  static fromRefresh(json: any): Token {
    return new Token(json.access_token, json.refresh_token, json.token_type);
  }

  static fromSerialization(serialized: string): Token {
    const json = JSON.parse(serialized);
    return Token.fromJson(json);
  }

  static fromJson({accessToken, refreshToken, tokenType, tokenCreated}): Token {
    return new Token(accessToken, refreshToken, tokenType, new Date(tokenCreated));
  }

  constructor(accessToken: string, refreshToken: string, tokenType: string, tokenExpires: Date = new Date()) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.tokenType = tokenType;
    this.tokenCreated = tokenExpires;
  }

  public serialize(): string {
    return JSON.stringify(this);
  }
}
