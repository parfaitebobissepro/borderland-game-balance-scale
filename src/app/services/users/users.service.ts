import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from 'src/app/models/user';
import { LocalService } from '../shared/local.service';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  currentUserSubject$$ = new BehaviorSubject<User>({} as User);
  currentUserKey = 'currentUser';

  constructor(private localService: LocalService) { }

  addCurrentUser(user: User): void {
    this.currentUserSubject$$.next(user);
    //store in local storage
    this.localService.saveData(this.currentUserKey,JSON.stringify(user));
  }

  getCurrentUser(): Observable<User> {
    return this.currentUserSubject$$;
  }

  getCurrentUserFromLocale():User{
    let userStringify = this.localService.getData(this.currentUserKey);
    return userStringify != "" ? JSON.parse(userStringify) : null;
  }
}
