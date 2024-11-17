import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardSessionComponent } from './dashboard-session.component';

describe('DashboardSessionComponent', () => {
  let component: DashboardSessionComponent;
  let fixture: ComponentFixture<DashboardSessionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardSessionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
