import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { SocketioService } from 'src/app/services/sockets/socketio.service';
import { Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  name: string = '';
  form: FormGroup;

  constructor(private socketService: SocketioService, private router: Router) {
    this.form = new FormGroup({
      name: new FormControl('', Validators.required),
    });
    this.socketService.setupSocketConnection().subscribe((data)=>{ 
      this.listenGameCreated() 
    });
  }

  createGameNewGame(): void {
    this.socketService.createRoom(this.name);
  }

  listenGameCreated() {
    this.socketService.connectedToRoom().subscribe((roomId) => {
      this.router.navigate(['/game', roomId]);
    });
  }

}
