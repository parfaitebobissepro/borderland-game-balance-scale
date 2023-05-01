import { Injectable } from '@angular/core';
import { environment } from 'environment';
import { Observable } from 'rxjs';
import { io } from 'socket.io-client';
import { Room } from 'src/app/models/room';

@Injectable({
  providedIn: 'root'
})
export class SocketioService {

  private socket: any;

  constructor() {

  }

  setupSocketConnection(): Observable<String> {
    return new Observable<String>((suscriber) => {
      this.socket = io(environment.SOCKET_ENDPOINT);
      this.socket.emit('emit_test', 'Hello there from Angular.');
      this.socket.on('receive_test', (data: String) => {
        suscriber.next(data);
        suscriber.complete();
      });
    });
  }

  connectToRoom(room: String) {
    this.socket.on('my broadcast', (data: String) => {
      console.log(data);
    });
  }

  createRoom(name: String) {
    try {
      this.socket.emit('createRoom', name);
    } catch (error) {
      console.log(error);
    }
  }
  createAndconnectToRoom(): Observable<Room> {
    let observable = new Observable<Room>((suscriber) => {
      try {
        this.socket.on(this.socket.id, (room: Room) => {
          suscriber.next(room);
          suscriber.complete();
        });
      } catch (error) {
        console.log(error);
      }
    });
    return observable;
  }

  ConnectedNewUserInRoom(pseudo: String, roomId: String): void {
    try {
      this.socket.emit('joinRoom', { pseudo: pseudo, roomId: roomId });
    } catch (error) {
      console.log(error);
    }
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

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
