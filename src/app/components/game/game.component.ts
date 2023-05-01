import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Room } from 'src/app/models/room';
import { Step } from 'src/app/models/step';
import { RoomsService } from 'src/app/services/rooms/rooms.service';
import { SocketioService } from 'src/app/services/sockets/socketio.service';
import { RegisterComponent } from 'src/app/shared/components/register/register.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  public roomId: string = '';
  public currentStep?: Step;

  //Observables
  public getCurrentRoom$$: Observable<Room> = new Observable();
  public getRoomById$$: Observable<Room> = new Observable();
  public getUpdatedRoom$$: Observable<Room> = new Observable();

  //Subscriptions
  public currentRoomSubscription$?: Subscription;
  public roomByIdSubscription$?: Subscription;
  public updatedRoomSubscription$?: Subscription;
  public subscription: Subscription = new Subscription();





  constructor(private socketService: SocketioService, private roomsService: RoomsService, private route: ActivatedRoute, public dialog: MatDialog) {
  }

  ngOnInit() {
    this.getCurrentRoom$$ = this.roomsService.getCurrentRoom();
    this.currentRoomSubscription$ = this.getCurrentRoom$$.subscribe((room) => {

      if (!room.id) {
        this.roomId = this.route.snapshot.paramMap.get('roomId') ?? '';
        this.openDialog();
        this.getRoomById$$ = this.roomsService.getRoomById(this.roomId);
        this.roomByIdSubscription$ = this.getRoomById$$?.subscribe((retrieveRoom) => {
          this.currentStep = retrieveRoom?.steps![retrieveRoom.steps!.length - 1];
          this.listenGameChange();
        });
        this.subscription.add(this.roomByIdSubscription$!);
      } else {
        this.currentStep = room?.steps![room.steps!.length - 1];
        this.roomId = room.roomId!;
        this.listenGameChange();
      }

    });

    this.subscription.add(this.currentRoomSubscription$);


  }

  listenGameChange() {
    this.getUpdatedRoom$$ = this.socketService.listenGameChange(this.roomId);

    this.updatedRoomSubscription$ = this.getUpdatedRoom$$.subscribe((newRoom: Room) => {
      this.roomsService.addCurrentRoom(newRoom);
    });
    this.subscription.add(this.updatedRoomSubscription$);
  }

  openDialog(): void {
    this.dialog.open<RegisterComponent>(RegisterComponent, {
      width: '250px',
      enterAnimationDuration: '20',
      exitAnimationDuration: '10',
      data: {
        currentRoomId: this.roomId,
      },
    });
  }

  ngOnDestroy() {
    this.socketService.disconnect();
    this.subscription.unsubscribe();
  }
}


