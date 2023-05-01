import { Component, OnInit } from '@angular/core';
import { SocketioService } from './services/sockets/socketio.service';
import { RoomsService } from './services/rooms/rooms.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  constructor(private socketService: SocketioService, private roomsService: RoomsService, private router: Router) {
  }
  ngOnInit(): void {
    //active sockects
    this.socketService.setupSocketConnection().subscribe((data) => {
      this.listenGameCreated()
    });
      
  }

  listenGameCreated() {
    this.socketService.createAndconnectToRoom().subscribe((room) => {
      this.roomsService.addCurrentRoom(room);
      this.router.navigate(['/game', room.roomId]);
    });
  }

}
