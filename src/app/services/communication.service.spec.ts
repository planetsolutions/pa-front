import { TestBed, inject } from '@angular/core/testing';

import { CommunicationService } from './communication.service';

describe('CommunicationService', () => {
  let service: CommunicationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CommunicationService]
    });
  });

  beforeEach(inject([CommunicationService], (communicationService) => {
    service = communicationService;
  }));

  it('should store value', (done) => {
    const key = 'KEY';
    const value = 'VALUE';
    service.get(key).subscribe((storedValue) => {
      expect(storedValue).toEqual(value);
      done();
    });

    service.set(key, value);
  });

  it('should remove value', (done) => {
    const key = 'KEY';
    const value = 'VALUE';
    service.get(key).skip(1).subscribe(
      () => fail('Should not receive anything'),
      () => fail('Should not throw error'),
      () => done()
    );

    service.set(key, value);
    service.remove(key);
  });

  it('should remove when value not present', (done) => {
    const key = 'KEY';

    service.get(key).subscribe(() => fail(), null, () => done());

    service.remove(key);
  });
});
