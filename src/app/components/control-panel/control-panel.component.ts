import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-control-panel',
  templateUrl: './control-panel.component.html',
  styleUrls: ['./control-panel.component.scss']
})
export class ControlPanelComponent implements OnInit {
  public responseNumbers : Array<Number> = Array.from({length:101},(_,index)=>index++);
  public selectedNumber? : Number;
  @Output() responseSelected: EventEmitter<Number> = new EventEmitter();


  public constructor() { }

  ngOnInit(): void {

  }

  selectNumber(number:Number):void{
    this.selectedNumber = number;
    this.responseSelected?.emit(this.selectedNumber);
  }

}
