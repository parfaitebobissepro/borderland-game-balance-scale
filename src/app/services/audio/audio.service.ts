import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private audios : HTMLAudioElement[] = [];

  constructor() { }

  public playAudio(path:string){
    
    let audio = new Audio();
    audio.src = path;
    this.audios.push(audio);

    audio.load();
    audio.play();
  }


  stopAllAudio(){
    this.audios.forEach(audio=>audio.pause());
  };


}
