export class SearchResultRow implements Iterable<SearchResultRowColumn> {
  public columns: Map<string, SearchResultRowColumn>;
  public id: string;

  constructor({id, columns}) {
    this.columns = new Map<string, SearchResultRowColumn>(columns.map((c, idx, arr) => {
      const col = new SearchResultRowColumn(c);
      return [col.name, col];
    }));
    this.id = id;
  }

  public get(name: string): SearchResultRowColumn {
    if (!this.columns.has(name)) {
      return {name: name};
    }
    return this.columns.get(name);
  }

  [Symbol.iterator](): Iterator<SearchResultRowColumn> {
    return this.columns.values();
  }
}

export class SearchResultRowColumn {
  public name: string;
  public value?: string;
  public rows?: SearchResultRow[];

  constructor({name, value, rows}) {
    this.name = name;
    this.value = value;
    if (!!rows) {
      this.rows = rows.map((r, idx, arr) => new SearchResultRow(r));
    }
  }
}
