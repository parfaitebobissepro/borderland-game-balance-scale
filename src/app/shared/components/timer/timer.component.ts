import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { Subscription, interval, take } from 'rxjs';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss']
})
export class TimerComponent implements OnInit {
  actualTime: Date = new Date(Date.now());
  targetTime?: Date;
  subscription?: Subscription;
  timeDifference?: Date;

  @Input() date?: Date;
  @Input() nmbrMilliSecond?: number;
  @Input() scheduler: number = 1000;

  @Output() counterStart: EventEmitter<any> = new EventEmitter();
  @Output() counterEnd: EventEmitter<any> = new EventEmitter();

  ngOnInit(): void {
    this.startCounter();
  }
  decrease() {
    //active the timer at some [scheduler] interval for only number of seconds steps [nmberSecond]
    this.subscription = interval(this.scheduler).pipe(take(Math.floor(this.nmbrMilliSecond! / 1000) + 1))
      .subscribe( 
        x=> { 
          this.timeDifference = new Date(this.targetTime!.getTime() - this.actualTime!.getTime() - (x * 1000));
          //if counter over, emit counterEnd Event. counter end when interval x is equal to seconds
          if (x === (Math.floor(this.nmbrMilliSecond! / 1000))) {
            this.counterEnd.emit();
          }
        } 
      );
  }


  startCounter(): void {
    //unsuscribe of previous count if subscription exist. to prevent multiples simulinatenous eventListeners
    if(this.subscription){
      this.subscription?.unsubscribe();
    }

    //reset parameters for count
    this.actualTime = new Date(this.date!);
    this.targetTime = new Date(this.actualTime.getTime() + this.nmbrMilliSecond!);

    //active a new timer
    this.decrease();
  }

  ngOnChanges(changes: SimpleChanges) { 
    //watch date change to restart automaticaly the counter 
    if (changes['date'].previousValue != null && changes['date'].previousValue != changes['date'].currentValue) {
      this.startCounter();
    }
  } 


  ngOnDestroy() {
    //unsuscribe when compone destroyed
    this.subscription?.unsubscribe();
  }

}
