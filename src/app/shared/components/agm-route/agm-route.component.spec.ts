import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgmRouteComponent } from './agm-route.component';

describe('AgmRouteComponent', () => {
  let component: AgmRouteComponent;
  let fixture: ComponentFixture<AgmRouteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgmRouteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgmRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
