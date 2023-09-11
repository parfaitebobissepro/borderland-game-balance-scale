import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private audios: HTMLAudioElement[] = [];

  constructor() { }

  public playAudio(path: string) {
    this.removeAudio(path);
    let audio = new Audio();
    audio.src = path;
    this.audios.push(audio);
    audio.load();
    audio.play();
  }

  public pauseAudio(path: string) {
    let audioIndex: number = this.audios.findIndex((audio) => audio.src.includes(path));
    console.log(this.audios);
    console.log(this.audios[audioIndex].src);
    this.audios[audioIndex].pause();
    this.audios[audioIndex].currentTime = 0;
    // this.removeAudio(path);

  }

  removeAudio(path: string) {
    let audioIndex: number = this.audios.findIndex((audio) => audio.src.includes(path));

    if (audioIndex != -1) {
      this.audios.splice(audioIndex, 1);
    }
  }


  stopAllAudio() {
    this.audios.forEach(audio => audio.pause());
  };


}
