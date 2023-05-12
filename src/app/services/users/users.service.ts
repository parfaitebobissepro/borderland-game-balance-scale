import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { User } from 'src/app/models/user';
import { LocalService } from '../shared/local.service';
import { ApiService } from '../shared/api.service';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  currentUserSubject$$ = new BehaviorSubject<User>({} as User);
  currentUserKey = 'currentUser';

  constructor(private localService: LocalService, private apiService: ApiService) { }

  addCurrentUser(user: User): void {
    this.currentUserSubject$$.next(user);
    //store in local storage
    this.localService.saveData(this.currentUserKey, JSON.stringify(user));
  }

  getCurrentUser(): Observable<User> {
    return this.currentUserSubject$$;
  }

  getCurrentUserFromLocale(): User {
    let userStringify = this.localService.getData(this.currentUserKey);
    return userStringify != "" ? JSON.parse(userStringify) : null;
  }

  getUser(id: String) {
    return new Observable<User>((suscriber) => {
      try {
        this.apiService.get(`/users/${id}`).subscribe((user: User) => {
          suscriber.next(user);
          suscriber.complete();
        }, err => {
          console.log(err);
          // check error status code is 500, if so, do some action
        }
        );
      } catch (error) {
        throw new Error(`User not exist`);
      }
    })
  }
}
