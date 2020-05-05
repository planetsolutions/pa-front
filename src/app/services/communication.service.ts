import {Injectable} from '@angular/core';
import {ReplaySubject} from 'rxjs/ReplaySubject';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class CommunicationService {
  private store = new Map<string, ReplaySubject<any>>();

  public set(key: string, value: any): void {
    if (!this.store.has(key)) {
      this.store.set(key, new ReplaySubject(1));
    }

    this.store.get(key).next(value);
  }

  public has(key: string): boolean {
    return this.store.has(key)
  }

  public get(key: string): Observable<any> {
    if (!this.store.has(key)) {
      this.store.set(key, new ReplaySubject(1));
    }

    return this.store.get(key).asObservable();
  }

  public remove(key: string): void {
    if (this.store.has(key)) {
      const subject = this.store.get(key);

      subject.complete();

      this.store.delete(key);
    }
  }
}
