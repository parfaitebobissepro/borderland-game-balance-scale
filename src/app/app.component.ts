import { Component, OnInit } from '@angular/core';
import { SocketioService } from './services/sockets/socketio.service';
import { RoomsService } from './services/rooms/rooms.service';
import { Router } from '@angular/router';
import { ServerParams } from './models/server-params';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  public setupSocketConnection$$: Observable<ServerParams> = new Observable();
  public setupSocketConnectionSubscription$?: Subscription;

  constructor(private socketService: SocketioService, private roomsService: RoomsService, private router: Router) {
  }
  ngOnInit(): void {
    //active sockects
    this.setupSocketConnection$$ = this.socketService.setupSocketConnection();
    
    this.setupSocketConnectionSubscription$ = this.setupSocketConnection$$.subscribe((data:ServerParams) => {
      this.listenGameCreated();
        this.roomsService.addCurrentServeParams(data);
    });
      
  }

  listenGameCreated() {
    this.socketService.createAndconnectToRoom().subscribe((room) => {
      this.roomsService.addCurrentRoom(room);
      this.router.navigate(['/game', room.roomId]);
    });
  }

  ngOnDestroy() {
    this.socketService.disconnect();
    this.setupSocketConnectionSubscription$?.unsubscribe();
  }

}
