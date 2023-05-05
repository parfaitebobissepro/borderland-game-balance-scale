import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Room } from 'src/app/models/room';
import { Step } from 'src/app/models/step';
import { RoomsService } from 'src/app/services/rooms/rooms.service';
import { SocketioService } from 'src/app/services/sockets/socketio.service';
import { RegisterComponent } from 'src/app/shared/components/register/register.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UsersService } from 'src/app/services/users/users.service';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})

export class GameComponent implements OnInit {
  //objects of models
  public currentStep?: Step;
  public currentRoom?: Room;
  public currentUser?: User;

  //others variables
  public roomId: string = '';
  public timerDate?: Date;
  public nmbrMilliSecond: number = 10000;
  public timeInterStep: number = 10000;
  public timeInterAwaitResponseServer: number = 2000;
  public responseTosend?: Number;
  public gameOver: Boolean = false;
  public alreadyStart: Boolean = false;
  public isGameOfCurrentGame: Boolean = true;

  //Observables
  public getCurrentRoom$$: Observable<Room> = new Observable();
  public getRoomById$$: Observable<Room> = new Observable();
  public getUpdatedRoom$$: Observable<Room> = new Observable();
  public getListenGameStart$$: Observable<Boolean> = new Observable();

  //Subscriptions
  public currentRoomSubscription$?: Subscription;
  public roomByIdSubscription$?: Subscription;
  public updatedRoomSubscription$?: Subscription;
  public getCurrentUserSubscription$?: Subscription;
  public getLisenGameStartSubscription$?: Subscription;
  public subscription: Subscription = new Subscription();





  constructor(private socketService: SocketioService, private roomsService: RoomsService, private route: ActivatedRoute, private usersService: UsersService, public dialog: MatDialog) {
  }

  ngOnInit() {
    this.getCurrentRoom$$ = this.roomsService.getCurrentRoom();
    this.currentRoomSubscription$ = this.getCurrentRoom$$.subscribe((room) => {

      if (!room.id) {
        //game don't exist in state

        //get the id of current room
        this.roomId = this.route.snapshot.paramMap.get('roomId') ?? '';

        //get the room
        this.getRoomById$$ = this.roomsService.getRoomById(this.roomId);
        this.roomByIdSubscription$ = this.getRoomById$$?.subscribe((retrieveRoom) => {

          //save current room
          this.currentRoom = retrieveRoom;

          this.currentStep = retrieveRoom?.steps![retrieveRoom.steps!.length - 1];

          this.retrieveTime();  

          this.currentUser = this.usersService.getCurrentUserFromLocale();

          //if we have more than one step then game start already, no more user can join the game
          this.alreadyStart = retrieveRoom.steps && retrieveRoom.steps?.length > 1 ? true : false;

          if (this.currentUser) {
            let index = this.currentStep.users?.findIndex(user => user.id == this.currentUser?.id);
            if (index == -1) {
              //user is not player of current game he cannot play
              this.isGameOfCurrentGame = false;
            }
            //share CurrentUser to Service
            this.usersService.addCurrentUser(this.currentUser);
          } else {
            //Show dailog to new user informations 
            this.openDialog();
          }

          //get the currentStep and listen the game from server 
          this.listenGameChange();

          //listen start of game
          this.lisenGameStart();
        });

        //add the subscription for common unsuscribre    
        this.subscription.add(this.roomByIdSubscription$!);
      } else {
        //game exist in state

        //save current room
        this.currentRoom = room;

        this.currentStep = room?.steps![room.steps!.length - 1];
        this.roomId = room.roomId!;

        this.retrieveTime();

        this.listenGameChange();

        //listen start of game
        this.lisenGameStart();
      }

    });

    this.listenCurrentUserChanges();

    //add the subscription for common unsuscribre
    this.subscription.add(this.currentRoomSubscription$);


  }

  listenGameChange() {
    this.getUpdatedRoom$$ = this.socketService.listenGameChange(this.roomId);
    this.updatedRoomSubscription$ = this.getUpdatedRoom$$.subscribe((newRoom: Room) => {
      //if we have a new step, it mean that we have a new step and need to start enterCouner
      if (newRoom.steps!.length > 1 && newRoom?.steps![newRoom.steps!.length - 1].id != this.currentStep?.id) {
        this.restartCounter(this.timeInterStep);
      }
      this.roomsService.addCurrentRoom(newRoom);
      if (newRoom.closed) {
        alert('GameOver');
      } 
    });

    //add the subscription for common unsuscribre
    this.subscription.add(this.updatedRoomSubscription$);
  }

  openDialog(): void {
    this.dialog.open<RegisterComponent>(RegisterComponent, {
      width: '250px',
      enterAnimationDuration: '20',
      exitAnimationDuration: '10',
      data: {
        currentRoomId: this.roomId,
        users: this.currentStep?.users
      },
    });
  } 

  listenCurrentUserChanges() {
    const getCurrentUser$$ = this.usersService.getCurrentUser();

    //sucribe to current user datas
    this.getCurrentUserSubscription$ = getCurrentUser$$.subscribe((user: User) => {
      this.currentUser = user;
    });

    //add the subscription for common unsuscribre
    this.subscription.add(this.getCurrentUserSubscription$);
  }

  lisenGameStart() {
    this.getListenGameStart$$ = this.socketService.listenGameLauched(this.roomId);
    this.getLisenGameStartSubscription$ = this.getListenGameStart$$.subscribe((response) => {
      if (response) {
        //activeTimerByDate 
        this.activeTimerByDate(new Date(this.currentRoom!.actualServerDate!), this.currentStep?.durationMillisecond!);
      }   
    });

    
    //add the subscription for common unsuscribre
    this.subscription.add(this.getLisenGameStartSubscription$);
  }

  counterEnd(): void {
    console.log('counter End');
    this.sendCurrentResponse();
  }

  activeTimerByDate(date: Date, nmbrMilliSecond: number): void {
    this.timerDate = date;
    this.nmbrMilliSecond = nmbrMilliSecond; 
    console.log('activeTimerByDate',nmbrMilliSecond);
  }

  restartCounter(nmbrMilliSecond: number) {
    setTimeout(() => {
      this.activeTimerByDate(this.currentStep?.startDate!, this.currentStep?.durationMillisecond!);
    }, nmbrMilliSecond);
  }

  updatResponseToSend(response: Number) {
    this.responseTosend = response;
  }

  sendCurrentResponse() {
    this.responseTosend = this.responseTosend || this.getRandomInt(100);
    this.socketService.respondToStepOfRoom(this.responseTosend, this.roomId, this.currentUser!, this.currentStep?.id!);
  }

  getRandomInt(max: number): Number {
    return Math.floor(Math.random() * max)
  }


  lauchGame(): void {
    this.socketService.launchGame(this.roomId);
  }

  retrieveTime(): void {
    console.log('actualServerDate',new Date(this.currentRoom!.actualServerDate!).getTime());
    console.log('startDate',new Date(this.currentStep?.startDate!).getTime());
    console.log('durationMillisecond',this.currentStep?.durationMillisecond!);

    const ADITIONNAL_WAITING_TIME = (this.timeInterAwaitResponseServer + this.timeInterStep) * this.currentStep?.rang!;
    
    //Retreive the timer
    this.activeTimerByDate(new Date(this.currentRoom!.actualServerDate!), this.currentStep?.durationMillisecond! - (new Date(this.currentRoom!.actualServerDate!).getTime() - new Date(this.currentStep?.startDate!).getTime()) + ADITIONNAL_WAITING_TIME);
  }

  ngOnDestroy() {  
    this.subscription.unsubscribe();
  }
}


