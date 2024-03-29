import { AfterViewInit, Component, OnInit } from '@angular/core';
import { SocketioService } from 'src/app/services/sockets/socketio.service';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user';
import { RoomsService } from 'src/app/services/rooms/rooms.service';
import { AudioService } from 'src/app/services/audio/audio.service';
import { MatDialog } from '@angular/material/dialog';
import { GameRulesComponent } from '../game-rules/game-rules.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  currentUser?: User;

  public audioMap: Map<string, string> = new Map<string, string>([
    ["mouseOverSound", "assets/audios/success_bell-6776.mp3"],
  ]);

  constructor(private socketService: SocketioService, private roomsService: RoomsService, private router: Router,  public audioService: AudioService, public dialog: MatDialog,) {
  }

  ngOnInit(): void {
    //intialise user
    this.currentUser = new User();
    this.currentUser.pseudo = '';
    this.audioService.stopAllAudio();

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

  openDialogRules(): void {
    this.dialog.open(GameRulesComponent, {
      enterAnimationDuration: '20',
      exitAnimationDuration: '10',
    });
  }



  playsoundMouseOver(){
    this.audioService.playAudio(this.audioMap.get('mouseOverSound')!);
  }



}
