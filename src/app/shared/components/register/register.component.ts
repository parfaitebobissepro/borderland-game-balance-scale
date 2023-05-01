import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from 'src/app/models/user';
import { SocketioService } from 'src/app/services/sockets/socketio.service';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit{
  currentUser?: User;
  constructor(public dialogRef: MatDialogRef<RegisterComponent>, @Inject(MAT_DIALOG_DATA) public data: {currentRoomId:String}, private socketService: SocketioService){
 
  }

  ngOnInit(): void {
    //intialise user
    this.currentUser = new User();
    this.currentUser.pseudo = '';
 
    //active sockects
    this.socketService.setupSocketConnection();
  }
 
  ConnectedNewUserInRoom(): void {
    this.socketService.ConnectedNewUserInRoom(this.currentUser?.pseudo!, this.data.currentRoomId!);
    this.closeDialog();
  }

  closeDialog() {
    this.dialogRef.close();
  }

}
