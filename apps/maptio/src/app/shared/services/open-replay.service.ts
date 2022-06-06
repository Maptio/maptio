import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OpenReplayService {

  constructor() { }

  public start() {
    console.log('Starting OpenReplay service');
  }
}
