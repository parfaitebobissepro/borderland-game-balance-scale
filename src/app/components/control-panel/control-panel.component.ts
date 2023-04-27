import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-control-panel',
  templateUrl: './control-panel.component.html',
  styleUrls: ['./control-panel.component.scss']
})
export class ControlPanelComponent implements OnInit {
  public responseNumbers : Array<Number> = Array.from({length:101},(_,index)=>index++);
  public selectedNumber? : Number;

  public constructor() { }

  ngOnInit(): void {

  }

  selectNumber(number:Number):void{
    this.selectedNumber = number;
  }

}
