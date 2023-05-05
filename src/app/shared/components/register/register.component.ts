import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from 'src/app/models/user';
import { SocketioService } from 'src/app/services/sockets/socketio.service';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  currentUser?: User;
  isPseudoAlreadyExistOnGame: Boolean = false;
  constructor(public dialogRef: MatDialogRef<RegisterComponent>, @Inject(MAT_DIALOG_DATA) public data: { currentRoomId: String, users: User[] }, private socketService: SocketioService) {

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

  checkPseudoValidity(){
    const index = this.data.users.findIndex(user=>user.pseudo?.toLocaleLowerCase() == this.currentUser?.pseudo?.toLocaleLowerCase());
    this.isPseudoAlreadyExistOnGame = index != -1;
  }



}
