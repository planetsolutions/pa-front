import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationTreeComponent } from './application-tree.component';

describe('ApplicationTreeComponent', () => {
  let component: ApplicationTreeComponent;
  let fixture: ComponentFixture<ApplicationTreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplicationTreeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
