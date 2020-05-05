import { Subject } from 'rxjs/Subject';
import { Subscriber } from 'rxjs/Subscriber';
import { Observable } from 'rxjs/Observable';

/**
 * Monitor-like subject, have 3 states.
 * 1. Right after creation will throw error for any subscriber.
 * 2. After startWaiting() method was called every subscriber will be added to pending list.
 * 3. After setReady() called all pending subscribers will receive next, and complete;
 *    all new subscribers will immediately receive next and complete;
 */

enum FlagState {
  THROWING_EXCEPTION, WAITING, READY
}

export class Flag {
  private state: FlagState = FlagState.THROWING_EXCEPTION;
  private waitSubject = new Subject();

  constructor(private errorMessage?: String) { }

  public setWaiting() {
    this.state = FlagState.WAITING;
  }

  public setReady() {
    this.state = FlagState.READY;
    this.waitSubject.next();
    this.waitSubject.complete();
  }

  public getObservable(): Observable<any> {
    return Observable.create((subscriber: Subscriber<any>) => {
      switch (this.state) {
        case FlagState.THROWING_EXCEPTION:
          subscriber.error(this.errorMessage);
          break;
        case FlagState.WAITING:
          this.waitSubject.subscribe(subscriber);
          break;
        case FlagState.READY:
          subscriber.next();
          subscriber.complete();
      }
    });
  }

  public throwError() {
    this.state = FlagState.THROWING_EXCEPTION;
    this.waitSubject.error('Manual throw');
  }
}
