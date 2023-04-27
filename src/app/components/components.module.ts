import { NgModule } from '@angular/core';
import { ControlPanelComponent } from './control-panel/control-panel.component';
import { CommonModule } from '@angular/common';
import { ResponseCardComponent } from './response-card/response-card.component';
import { UserComponent } from './user/user.component';
import { HomeComponent } from './home/home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GameComponent } from './game/game.component';


@NgModule({
    declarations: [
        ControlPanelComponent,
        ResponseCardComponent,
        UserComponent,
        HomeComponent,
        GameComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule
    ],
    exports: [
        ControlPanelComponent,
        ResponseCardComponent,
        UserComponent,
        HomeComponent,
        GameComponent

    ],
})
export class ComponentsModule { }