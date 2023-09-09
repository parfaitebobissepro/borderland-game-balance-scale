import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Room } from 'src/app/models/room';
import { Step } from 'src/app/models/step';
import { RoomsService } from 'src/app/services/rooms/rooms.service';
import { SocketioService } from 'src/app/services/sockets/socketio.service';
import { RegisterComponent } from 'src/app/shared/components/register/register.component';
import { MatDialog } from '@angular/material/dialog';
import { UsersService } from 'src/app/services/users/users.service';
import { User } from 'src/app/models/user';
import { ServerParams } from 'src/app/models/server-params';
import { startFrom } from 'src/main';
import { GameRulesComponent } from '../game-rules/game-rules.component';
import { GameCongratComponent } from '../game-congrat/game-congrat.component';
import { GameOverComponent } from '../game-over/game-over.component';
import { AudioService } from 'src/app/services/audio/audio.service';

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
  public nmbrMilliSecond: number = 0;
  public timeInterStep: number = 4000;
  public serverParams?: ServerParams;
  public responseTosend?: Number;
  public alreadyStart: Boolean = false;
  public isUserOfCurrentGame: Boolean = true;
  public timeOfRetrieveRequest?: number;
  public runningAnimation: Boolean = false;

  public urlLink?:string;

  //game state variables
  public isgameOverAndlooser: Boolean = false;
  // public isgameOverAndwiner: Boolean = false; 
  // public isgameOverAndwiner: Boolean = false; 


  //current step variables
  public currentAverage?: number;

  //Observables
  public getCurrentServeParams$$: Observable<ServerParams> = new Observable();
  public getCurrentRoom$$: Observable<Room> = new Observable();
  public getRoomById$$: Observable<Room> = new Observable();
  public getUpdatedRoom$$: Observable<Room> = new Observable();
  public getListenGameStart$$: Observable<Boolean> = new Observable();
  public getRemoteUser$$: Observable<User> = new Observable();
  public getListeUsersChange$$: Observable<User> = new Observable();

  //Subscriptions
  public currentServeParamsSubscription$?: Subscription;
  public currentRoomSubscription$?: Subscription;
  public roomByIdSubscription$?: Subscription;
  public updatedRoomSubscription$?: Subscription;
  public getCurrentUserSubscription$?: Subscription;
  public getLisenGameStartSubscription$?: Subscription;
  public getRemoteUserSubscription$?: Subscription;
  public getLisenUsersChangeSubscription$?: Subscription;
  public subscriptions: Subscription = new Subscription();


  //start time of component
  public startFrom = startFrom;

  public audioMap: Map<string, string> = new Map<string, string>([
    ["gameOverLooser", "assets/audios/manx27s-cry-122258.mp3"],
    ["gameOverWinner", "assets/audios/tada-fanfare-a-6313.mp3"],
    ["globalGame", "assets/audios/gamemusic-6082.mp3"],
    ["button", "assets/audios/mech-keyboard-02-102918.mp3"],
    ["winnerStep", "assets/audios/goodresult-82807.mp3"],
    ["mouseOverSound", "assets/audios/success_bell-6776.mp3"]
  ]);




  constructor(private socketService: SocketioService, private roomsService: RoomsService, private route: ActivatedRoute, private usersService: UsersService, public dialog: MatDialog, public audioService: AudioService,private router: Router) {
  }



  ngOnInit() {
    this.playGameAudio();

    //set url to share
    this.urlLink = location.origin+this.router.url;

    //init serve params
    this.getCurrentServeParams$$ = this.roomsService.getCurrentServeParams();
    this.currentServeParamsSubscription$ = this.getCurrentServeParams$$.subscribe(serveParams => {
      if (Object.keys(serveParams).length) {
        this.serverParams = serveParams;
        this.subscriptions.add(this.currentServeParamsSubscription$);


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

              //set the retrive request time
              this.timeOfRetrieveRequest = new Date().getTime() - this.startFrom;
              console.log('timeOfRetrieveRequest', this.timeOfRetrieveRequest);


              this.retrieveTime();

              //get user id in user datas
              this.currentUser = this.usersService.getCurrentUserFromLocale();


              //if we have more than one step then game start already, no more user can join the game
              this.alreadyStart = retrieveRoom.steps && retrieveRoom.steps?.length > 1 ? true : false;

              if (this.currentUser) {

                //get user updated datas from the server
                this.getRemoteUser$$ = this.usersService.getUser(this.currentUser.id!);
                this.getRemoteUserSubscription$ = this.getRemoteUser$$.subscribe(
                  retriveUser => {
                    let index = this.currentStep?.users?.findIndex(user => user.id == retriveUser?.id);
                    if (index == -1) {
                      //TODO:::user is not player of current game he cannot play
                      this.isUserOfCurrentGame = false;
                      console.log('user is not player of current game he cannot play', 'color:#F00');
                      //Show dailog to new user informations 
                      this.openDialogForJoin();
                    } else {
                      //share CurrentUser to Service
                      this.usersService.addCurrentUser(retriveUser);
                      this.socketService.addNewConnectedGame(retriveUser.id!, retrieveRoom.id!);
                    }

                  });


              } else {
                //Show dailog to new user informations 
                this.openDialogForJoin();
              }

              //get the currentStep and listen the game from server 
              this.listenGameChange();

              //listen start of game
              this.listenGameStart();

              //listen users changes
              this.listenUsersChange();
            });

            //add the subscription for common unsuscribre    
            this.subscriptions.add(this.roomByIdSubscription$);
            this.subscriptions.add(this.getRemoteUserSubscription$);
          } else {
            //game exist in state

            //save current room
            this.currentRoom = room;

            this.currentStep = room?.steps![room.steps!.length - 1];
            this.roomId = room.roomId!;

            this.retrieveTime();

            this.listenGameChange();

            //listen start of game
            this.listenGameStart();

            //listen users changes
            this.listenUsersChange();
          }

        });

        this.listenCurrentUserChanges();

        //add the subscription for common unsuscribre
        this.subscriptions.add(this.currentRoomSubscription$);
      }
    });


  }

  currentlyDataUpdate() {
    let responsesArray: Array<number> = [];
    let usersCanBeCounted = this.currentStep?.users?.filter((user) => user.globalScore! > 0);
    if (usersCanBeCounted?.length == 1 && usersCanBeCounted[0].id == this.currentUser!.id) {
      console.log("Congratulations you are the winner!!!!!!");
      this.processGameOverWinner();
      this.subscriptions.unsubscribe();
    }
    usersCanBeCounted?.forEach((user) => responsesArray.push(user.currentResponse!));
    this.currentAverage = this.getAverage(responsesArray);
  }

  listenGameChange() {
    this.getUpdatedRoom$$ = this.socketService.listenGameChange(this.roomId);
    this.updatedRoomSubscription$ = this.getUpdatedRoom$$.subscribe((newRoom: Room) => {
      //if we have a new step, it mean that we have a new step and need to start enterCouner

      //update current User
      this.usersService.addCurrentUser(newRoom.steps![newRoom.steps!.length - 1].users!.find((user: User) => user.id == this.currentUser?.id)!);

      if (newRoom.steps!.length > 1 && newRoom?.steps![newRoom.steps!.length - 1].id != this.currentStep?.id) {
        this.restartCounter(this.timeInterStep);
         this.playStepAudio();



        //check state of currentUser
        if (this.currentUser!.globalScore! <= 0) {
          console.log('Game Over');
          this.processGameOverLooser();
          // this.subscriptions.unsubscribe();
        }
      }
      this.roomsService.addCurrentRoom(newRoom);
      this.currentlyDataUpdate();
      if (newRoom.closed) {
        console.log('Game have been closed');
        this.subscriptions.unsubscribe();
      }
    });

    //add the subscription for common unsuscribre
    this.subscriptions.add(this.updatedRoomSubscription$);
  }

  openDialogForJoin(): void {
    this.dialog.open<RegisterComponent>(RegisterComponent, {
      // width: '250px',
      enterAnimationDuration: '20',
      exitAnimationDuration: '10',
      data: {
        currentRoomId: this.roomId,
        users: this.currentStep?.users
      },
    });
  }

  openDialogRules(): void {
    this.dialog.open(GameRulesComponent, {
      enterAnimationDuration: '20',
      exitAnimationDuration: '10',
    });
  }

  processGameOverLooser(): void {
    this.isgameOverAndlooser = true;
    this.audioService.playAudio(this.audioMap.get('gameOverLooser')!);
  }

  processGameOverWinner(): void {
    this.audioService.playAudio(this.audioMap.get('gameOverWinner')!);
    this.dialog.open(GameCongratComponent, {
      width: '40vw',
      enterAnimationDuration: '20',
      exitAnimationDuration: '10',
    });
    
  }

  playGameAudio(){
    // this.audioService.playAudio(this.audioMap.get('globalGame')!);
  }
  playStepAudio(){
    this.audioService.playAudio(this.audioMap.get('winnerStep')!);
  }
  playKeyboardAudio(){
    this.audioService.playAudio(this.audioMap.get('button')!);
  }
  PlaysoundMouseOver(){
    this.audioService.playAudio(this.audioMap.get('mouseOverSound')!);
  }

  listenCurrentUserChanges() {
    const getCurrentUser$$ = this.usersService.getCurrentUser();

    //sucribe to current user datas
    this.getCurrentUserSubscription$ = getCurrentUser$$.subscribe((user: User) => {
      this.currentUser = user;
    });

    //add the subscription for common unsuscribre
    this.subscriptions.add(this.getCurrentUserSubscription$);
  }

  listenGameStart() {
    this.getListenGameStart$$ = this.socketService.listenGameLauched(this.roomId);
    this.getLisenGameStartSubscription$ = this.getListenGameStart$$.subscribe((response) => {
      if (response) {
        //activeTimerByDate 
        this.activeTimerByDate(new Date(this.currentRoom!.actualServerDate!), this.currentStep?.durationMillisecond!);
      }
    });


    //add the subscription for common unsuscribre
    this.subscriptions.add(this.getLisenGameStartSubscription$);
  }

  listenUsersChange() {
    this.getListeUsersChange$$ = this.socketService.listenUsersChange(this.currentRoom?.id!);
    this.getLisenUsersChangeSubscription$ = this.getListeUsersChange$$.subscribe((data: any) => {
      //update user in laststep of currentRoom and save this
      this.currentStep!.users = this.currentStep!.users!.map((user: User) => {
        const userUpdate = user.id == data.id ? { ...user, ...data } as User : user;
        if (user.id == this.currentUser!.id) {
          this.currentUser = userUpdate;
        }
        return userUpdate;
      });

      // this.roomsService.addCurrentRoom(this.currentRoom!);
    });
  }

  counterEnd(): void {
    this.sendCurrentResponse();
  }

  activeTimerByDate(date: Date, nmbrMilliSecond: number): void {
    this.timerDate = date;
    this.nmbrMilliSecond = nmbrMilliSecond;
  }

  restartCounter(nmbrMilliSecond: number) {
    setTimeout(() => {
      this.activeTimerByDate(this.currentStep?.startDate!, this.currentStep?.durationMillisecond!);
    }, nmbrMilliSecond);
  }

  updatResponseToSend(response: Number) {
    this. playKeyboardAudio();
    this.responseTosend = response;
  }


  sendCurrentResponse() {
    this.responseTosend = this.responseTosend != null ? this.responseTosend : this.getRandomInt(100);
    this.socketService.respondToStepOfRoom(this.responseTosend, this.roomId, this.currentUser!, this.currentStep?.id!);

    //reset response
    this.responseTosend = undefined;
  }

  getRandomInt(max: number): Number {
    return Math.floor(Math.random() * max)
  }


  lauchGame(): void {
    this.socketService.launchGame(this.roomId);
  }

  retrieveTime(): void {
    const TIME_OF_STEP_SPEND = new Date(this.currentRoom!.actualServerDate!).getTime() - new Date(this.currentStep?.startDate!).getTime();
    const DURATION_LEFT = this.currentStep?.durationMillisecond! - TIME_OF_STEP_SPEND + (this.timeOfRetrieveRequest ? Math.round(this.timeOfRetrieveRequest / 1000) * 1000 : 0) + this.timeInterStep;

    //Retreive the timer
    this.activeTimerByDate(new Date(this.currentRoom!.actualServerDate!), DURATION_LEFT);

    //reset time of retrieve at undefined
    if (this.timeOfRetrieveRequest) {
      this.timeOfRetrieveRequest = undefined;
    }
  }

  handleCopy(e:Event){
    if(!this.runningAnimation){
        this.runningAnimation = true;
        const eventTarget = (e.target as HTMLInputElement )!;
        eventTarget.textContent = "Copied !";

        setTimeout(() => {
          eventTarget.textContent = "Copy";
            this.runningAnimation = false;
        }, 1250);
    }

    navigator.clipboard.writeText(this.urlLink!);
  }

  
  async makeGameStepRules() {
    let step = this.currentStep!;

    //if step not close

  }

  async getStepWinner() {
    let step = this.currentStep!;

    //get user most near to average
    const MAX = 100;
    let min = MAX;
    let userStepwinner = MAX;
    let isExactlyTargetNumber = false;

    let usersWithSameResponses: Array<String> = [];



    //TODO: check number of participats before assign winner with right rule
    if (step.users!.length <= 2) {
      //TODO: if we have 2 participants

      // let userWithResponseZero = step.users?.find((user) => user.currentResponse == 0);

      // if (userWithResponseZero) {
      //   let otherUser = step.users?.find((user) => user.currentResponse == MAX);
      //   if (otherUser) {
      //     //user with 0 response is loser 
      //     userWithResponseZero!.globalScore!--;
      //     await userService.updateUserById(userWithResponseZero.id, userWithResponseZero);

      //     //other user is winner
      //     otherUser.currentWinner = true;
      //     await userService.updateUserById(otherUser.id, otherUser);

      //     //return game result
      //     return {
      //       userStepwinner: otherUser
      //     }
      //   }
      // }

    }

    if (step.users!.length <= 4) {
      //TODO: if we have 3 participants

      //decrement globalScore of users
      // for (let user of step.users) {
      //   let userWithSameResponse = step.users.find((element) => element.currentResponse == user.currentResponse && element.id != user.id);
      //   if (userWithSameResponse) {
      //     user.sameCurrentResponse = true;
      //     user.globalScore--;
      //     await userService.updateUserById(user.id, user);
      //     usersWithSameResponses.push(user);
      //   }
      // }

      // //remove users with same Responses
      // usersWithSameResponses = usersWithSameResponses.map((userWithSameResponses) => userWithSameResponses = userWithSameResponses.id);
      // step.users = step.users.filter((user) => !usersWithSameResponses.includes(user.id));
    }


    if (step.users!.length > 0) {
      //get array of responses
    }
  }

  getAverage(arrayResponses: Array<number>): number {
    // Using reduce() to sum up the array elements
    const sum = arrayResponses.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    // Calculating the average by dividing the sum by the number of elements
    return sum / arrayResponses.length;
  }


  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}


