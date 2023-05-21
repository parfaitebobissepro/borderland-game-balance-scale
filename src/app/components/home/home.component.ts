import { AfterViewInit, Component, OnInit } from '@angular/core';
import { SocketioService } from 'src/app/services/sockets/socketio.service';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user';
import { RoomsService } from 'src/app/services/rooms/rooms.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  currentUser?: User;

  constructor(private socketService: SocketioService, private roomsService: RoomsService, private router: Router) {
  }

  ngOnInit(): void {
    //intialise user
    this.currentUser = new User();
    this.currentUser.pseudo = '';

  }

  createGameNewGame(): void {
    this.socketService.createRoom(this.currentUser?.pseudo!);
  }

  // Image Preview
  showPreview(event:any) {
    const file = event!.target!.files[0];

    // File Preview
    const reader = new FileReader();
    reader.onload = () => {
      this.currentUser!.image = reader.result as string;
    }
    reader.readAsDataURL(file)
  }

  // Sub


}
