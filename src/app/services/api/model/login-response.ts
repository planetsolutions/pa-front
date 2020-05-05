export class LoginResponse {
  public accessToken: string;
  public tokenType: string;
  public refreshToken: string;
  public expiresIn: string;
  public scope: string;
  public jti: string;

  constructor(json: any) {
    this.accessToken = json.access_token;
    this.tokenType = json.token_type;
    this.refreshToken = json.refresh_token;
    this.expiresIn = json.expires_in;
    this.scope = json.scope;
    this.jti = json.jti;
  }
}
