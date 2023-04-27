import { Injectable } from '@angular/core';
import { environment } from 'environment';
import { Observable } from 'rxjs';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketioService {

  private socket: any;

  constructor() {

  }

  setupSocketConnection(): Observable<string> {
    return new Observable<string>((suscriber) => {
      this.socket = io(environment.SOCKET_ENDPOINT);
      this.socket.emit('emit_test', 'Hello there from Angular.');
      this.socket.on('receive_test', (data: string) => {
        suscriber.next(data);
        suscriber.complete();
      });
    });
  }

  connectToRoom(room: string) {
    this.socket.on('my broadcast', (data: string) => {
      console.log(data);
    });
  }

  createRoom(name: string) {
    try {
      this.socket.emit('createRoom', name);
    } catch (error) {
      console.log(error);
    }
  }
  connectedToRoom(): Observable<string> {
    let observable = new Observable<string>((suscriber) => {
      try {
        this.socket.on(this.socket.id, (roomId: string) => {
          console.log(roomId);
          suscriber.next(roomId);
          suscriber.complete();
        });
      } catch (error) {
        console.log(error);
      }
    });
    return observable;
  }

  newConnectedOnRoom(room: string): Observable<any> {
    let observable = new Observable<any>((suscriber) => {
      try {
        this.socket.on(room, (data:any) => {
          console.log(data.roomId);
          console.log(data.users);
          suscriber.next({ roomId: data.roomId, users: data.users });
          suscriber.complete();
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
