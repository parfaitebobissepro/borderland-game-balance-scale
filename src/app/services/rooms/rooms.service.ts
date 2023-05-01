import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Room } from 'src/app/models/room';
import { ApiService } from '../shared/api.service';

@Injectable({
  providedIn: 'root'
})
export class RoomsService {

  currentRoombject$$ = new BehaviorSubject<Room>(new Room());
  
  constructor(private apiService: ApiService) {
    
  }

  addCurrentRoom(room: Room): void {
    this.currentRoombject$$.next(room); 
  }

  getCurrentRoom(): Observable<Room> {
    return this.currentRoombject$$;
  }

  getRoomById(id: String): Observable<Room> {
    return this.apiService.get(`/rooms/${id}`);
  }
}
