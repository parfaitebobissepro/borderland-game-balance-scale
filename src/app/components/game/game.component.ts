import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SocketioService } from 'src/app/services/sockets/socketio.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent {
  public roomId: string = '';
  public users: Array<any> = [];

  constructor(private socketService: SocketioService, private route: ActivatedRoute) {
    this.roomId = this.route.snapshot.paramMap.get('roomId') ?? '';
    this.socketService.newConnectedOnRoom(this.roomId).subscribe((data) => {
      this.users = data.users;
      console.log(this.users);
    });
  }

  ngOnInit() {

  }

  ngOnDestroy() {
    this.socketService.disconnect();
  }
}
