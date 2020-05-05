import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjectsListCellComponent } from './objects-list-cell.component';

describe('ObjectsListCellComponent', () => {
  let component: ObjectsListCellComponent;
  let fixture: ComponentFixture<ObjectsListCellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ObjectsListCellComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjectsListCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
