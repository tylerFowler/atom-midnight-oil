'use babel';

import EventEmitter from 'events'

export default class TimeEmitter extends EventEmitter {
  constructor(dayTime, nightTime) {
    let curTime = new Date();
    let msToDay = Math.abs(curTime - dayTime);
    let msToNight = Math.abs(curTime - nightTime);

    this.dayTimerId = setTimeout(() => this.emit('day'), msToDay);
    this.nightTimerId = setTimeout(() => this.emit('night'), msToNight);
  }

  dispose() {
    clearTimeout(this.dayTimerId);
    clearTimeout(this.nightTimerId);
  }
}