import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameCongratComponent } from './game-congrat.component';

describe('GameCongratComponent', () => {
  let component: GameCongratComponent;
  let fixture: ComponentFixture<GameCongratComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GameCongratComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameCongratComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
