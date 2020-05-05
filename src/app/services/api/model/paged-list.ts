export class PagedList<T> {
  public data: T[];
  public total: number;
  public isLast: boolean;

  constructor(data: T[], total: number, isLast = false) {
    this.data = data;
    this.total = total;
    this.isLast = isLast;
  }
}
