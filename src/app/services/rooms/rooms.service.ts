import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, distinctUntilChanged } from 'rxjs';
import { Room } from 'src/app/models/room';
import { ApiService } from '../shared/api.service';
import { ServerParams } from 'src/app/models/server-params';

@Injectable({
  providedIn: 'root'
})
export class RoomsService {

  currentRoomsubject$$ = new BehaviorSubject<Room>({} as Room);

  currentServeParams$$ = new BehaviorSubject<ServerParams>({} as ServerParams);


  constructor(private apiService: ApiService) {
  }

  addCurrentRoom(room: Room): void {
    this.currentRoomsubject$$.next(room); 
  }

  getCurrentRoom(): Observable<Room> {
    return this.currentRoomsubject$$;
  }

  getRoomById(id: String): Observable<Room> {
    return this.apiService.get(`/rooms/${id}`);
  }

  addCurrentServeParams(serverParams: ServerParams): void {
    this.currentServeParams$$.next(serverParams); 
  }

  getCurrentServeParams(): Observable<ServerParams> {
    return this.currentServeParams$$;
  }

  
}
