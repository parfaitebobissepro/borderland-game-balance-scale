import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { User } from 'src/app/models/user';
import { LocalService } from '../shared/local.service';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  currentUserubject$$ = new Subject<User>();
  currentUserKey = 'currentUser';

  constructor(private localService: LocalService) { }

  addCurrentUser(user: User): void {
    this.currentUserubject$$.next(user);
    //store in local storage
    this.localService.saveData(this.currentUserKey,JSON.stringify(user));
  }

  getCurrentUser(): Observable<User> {
    return this.currentUserubject$$;
  }
}
