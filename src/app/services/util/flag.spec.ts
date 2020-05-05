import { Flag } from './flag';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/observable/timer';


describe('FlagSubject', () => {
  let flag: Flag;
  const errMessage = 'error message';

  beforeEach(() => {
    flag = new Flag(errMessage);
  });

  it('should call error when not ready', (done) => {
    flag.getObservable().subscribe(
      () => fail('should not call next'),
      (err) => {
        expect(err).toEqual(errMessage);
        done();
      },
      () => fail('should not succesfully complete')
    );
  });

  it('should complete when ready', (done) => {
    flag.setWaiting();
    flag.setReady();

    flag.getObservable().subscribe(
      () => { },
      (err) => fail(`should not fail, ${err}`),
      () => {
        done();
      }
    );
  });

  it('should immediately be complete when ready', (done) => {
    flag.setWaiting();
    flag.setReady();

    flag.getObservable()
      .flatMap(() => flag.getObservable()) // chain subscriptions
      .subscribe(
        () => { },
        (err) => fail(`should not fail, ${err}`),
        () => {
          done();
        }
      );
  });

  it('should call next once when ready', (done) => {
    flag.setWaiting();
    flag.setReady();

    let calls = 0;
    flag.getObservable().subscribe(
      () => calls++,
      (err) => fail(`should not fail, ${err}`),
      () => {
        expect(calls).toEqual(1);
        done();
      }
    );
  });

  it('should wait while not ready', (done) => {
    flag.setWaiting();

    let complete = false;
    flag.getObservable().subscribe(
      () => { },
      (err) => fail(`should not fail, ${err}`),
      () => {
        complete = true;
        done();
      }
    );

    Observable.timer(100)
      .do(() => {
        expect(complete).toEqual(false);
        flag.setReady();
      }).subscribe();
  });

  it('should throw error manually', (done) => {
    flag.setWaiting();

    flag.getObservable().subscribe(
      () => fail(),
      () => done(),
      () => fail()
    );

    flag.throwError();
  });

  it('should throw error manually 2', (done) => {
    flag.setWaiting();
    flag.setReady();
    flag.throwError();

    flag.getObservable().subscribe(
      () => fail(),
      () => done(),
      () => fail()
    );
  });
});
