import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameRulesComponent } from './game-rules.component';

describe('GameRulesComponent', () => {
  let component: GameRulesComponent;
  let fixture: ComponentFixture<GameRulesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GameRulesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
