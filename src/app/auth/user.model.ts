export class User {
  constructor(
    public id: string,
    public email: string,
    private _token: string,
    private tokenExpirationDate: Date
  ) {}

  /**
   * 使用 token 判斷使用者是否是 valid user 或者允許可以登入
   * null 代表 user is not authenticated
   */
  get token() {
      if (!this.tokenExpirationDate || this.tokenExpirationDate <= new Date()) {
          return null;
      }
      return this._token;
  }
}
