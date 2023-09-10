import { Injectable } from '@angular/core';
import { environment } from 'environment';
import { Observable } from 'rxjs';
import { io } from 'socket.io-client';
import { Room } from 'src/app/models/room';
import { UsersService } from '../users/users.service';
import { User } from 'src/app/models/user';
import { ServerParams } from 'src/app/models/server-params';
import { RoomsService } from '../rooms/rooms.service';

@Injectable({
  providedIn: 'root'
})
export class SocketioService {

  private socket: any;
  private socketActive: Boolean = false;

  constructor(private userService: UsersService, private roomsService: RoomsService) {

  }

  setupSocketConnection(): Observable<ServerParams> {
    return new Observable<ServerParams>((suscriber) => {
      this.socket = io(environment.SOCKET_ENDPOINT);
      this.socket.emit('getParamsOfServer', 'Hello there from Angular.');
      this.socket.on('serverParams', (data: ServerParams) => {
        suscriber.next(data);
        suscriber.complete();
      });
      this.socketActive = true;
    });
  }


  isSocketActive(): Boolean {
    return this.socketActive;
  }

  createRoom(name: String) {
    try {
      this.socket.emit('createRoom', name);
    } catch (error) {
      console.log(error);
    }
  }
  createAndconnectToRoom(): Observable<Room> {
    let observable$ = new Observable<Room>((suscriber) => {
      try {
        this.socket.on(this.socket.id, (room: Room) => {
          //add the first user as current player
          if (room.steps && room.steps[0].users && room.steps[0].users[0]) {
            this.userService.addCurrentUser(room.steps[0].users[0])
          }
          suscriber.next(room);
        });
      } catch (error) {
        console.log(error);
      }
    });
    return observable$;
  }

  ConnectedNewUserInRoom(pseudo: String, roomId: String): void {
    try {
      this.listenCurrentUserDatas(pseudo, roomId);
      this.socket.emit('joinRoom', { pseudo: pseudo, roomId: roomId });
    } catch (error) {
      console.log(error);
    }
  }
  respondToStepOfRoom(response: Number, roomId: String, user: User, stepId: String): void {
    try {
      this.socket.emit('respondToStep', { response: response, roomId: roomId, userId: user.id, stepId: stepId });
      if (user.admin) {
        this.socket.emit('makeStepGameOfRoom', { roomId: roomId, stepId: stepId });
      }
    } catch (error) {
      console.log(error);
    }
  }

  listenCurrentUserDatas(pseudo: String, roomId: String) {
    this.socket.on(`${roomId}-${pseudo}`, (data: any) => {
      if (data.type == 'user') {
        this.userService.addCurrentUser(data.content);
      }
    });
  }

  listenGameChange(roomId: String) {
    let observable = new Observable<Room>((suscriber) => {
      try {
        this.socket.on(`game-${roomId}`, (room: Room) => {
          suscriber.next(room);
        });
      } catch (error) {
        console.log(error);
      }
    });
    return observable;
  }

  listenGameLauched(roomId: String) {
    let observable = new Observable<Boolean>((suscriber) => {
      try {
        this.socket.on(`startGame-${roomId}`, (response: Boolean) => {
          suscriber.next(response);
        });
      } catch (error) {
        console.log(error);
      }
    });
    return observable;
  }
  launchGame(roomId: String) {
    try {
      this.socket.emit('lauchGame', roomId);
    } catch (error) {
      console.log(error);
    }
  }
  listenUsersChange(id: String) {
    let observable = new Observable<any>((suscriber) => {
      try { 
        this.socket.on(`update-user-${id}`, (data: any) => {
          suscriber.next(data);
          console.log(data);
        });
      } catch (error) {
        console.log(error);
      }
    });
    return observable;
  }
  addNewConnectedGame(userId: String, roomId: String) {
    try {
      this.socket.emit('addNewConnectedGame', { userId: userId, roomId: roomId });
    } catch (error) {
      console.log(error);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socketActive = false;
    }
  }
}
