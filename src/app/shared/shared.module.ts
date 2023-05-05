import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegisterComponent } from './components/register/register.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TimerComponent } from './components/timer/timer.component';



@NgModule({
  declarations: [
    RegisterComponent,
    TimerComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports:[
    FormsModule,
    ReactiveFormsModule,
    RegisterComponent,
    TimerComponent
  ]
})
export class SharedModule { }
