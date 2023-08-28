import { NgModule } from '@angular/core';
import { ControlPanelComponent } from './control-panel/control-panel.component';
import { CommonModule } from '@angular/common';
import { ResponseCardComponent } from './response-card/response-card.component';
import { UserComponent } from './user/user.component';
import { HomeComponent } from './home/home.component';
import { GameComponent } from './game/game.component';
import { SharedModule } from '../shared/shared.module';
import { GameOverComponent } from './game-over/game-over.component';
import { GameRulesComponent } from './game-rules/game-rules.component';
import { GameCongratComponent } from './game-congrat/game-congrat.component';

@NgModule({
    declarations: [
        ControlPanelComponent,
        ResponseCardComponent,
        UserComponent,
        HomeComponent,
        GameComponent,
        GameOverComponent,
        GameRulesComponent,
        GameCongratComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
    ],
    exports: [
        ControlPanelComponent,
        ResponseCardComponent,
        UserComponent,
        HomeComponent,
        GameComponent,

    ],
})
export class ComponentsModule { }