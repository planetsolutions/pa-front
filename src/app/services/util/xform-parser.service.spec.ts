import { TestBed, inject } from '@angular/core/testing';

import { XformParserService } from './xform-parser.service';

describe('XformParserService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [XformParserService]
    });
  });

  it('should be created', inject([XformParserService], (service: XformParserService) => {
    expect(service).toBeTruthy();
  }));
});
