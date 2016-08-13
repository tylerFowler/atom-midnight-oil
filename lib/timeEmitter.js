'use babel';

import EventEmitter from 'events';

/**
  @class TimeEmitter
  @extends EventEmitter
  @desc TimeEmitter sets up timers to the next transition times and emits
    'day' and 'night' events when a transition time is reached, automatically
    switches the times to the current date at midnight
**/
export default class TimeEmitter extends EventEmitter {
  constructor(dayTime, nightTime) {
    super();
    this.dayTime = dayTime;
    this.nightTime = nightTime;
    this.warningTime = 5 * 60 * 1000;

    this.setTimers();
  }

  /**
    @name setTimers
    @desc sets up the timers by calculating the ms until the next trigger time
  **/
  setTimers() {
    // reset any previous interval checker
    clearInterval(this.checkIntervalId);

    // the threshold at which we start more precise countdowns, in ms
    const countdownThreshold = this.warningTime * 5;

    // starts the precise timeouts to day switchover
    const startDayCountdown = () => {
      const curTime = new Date();
      const msToDay = Math.abs(curTime - this.dayTime);
      this.dayTimerId = setTimeout(() => this.emit('day'), msToDay);

      const msToDayWarning = msToDay - this.warningTime;
      if (msToDayWarning > 1000) this.dayWarningTimerId = setTimeout(() =>
        this.emit('dayWarning'), msToDayWarning);
    };

    // starts the precise timeouts to night swithover as well as the
    // midnight recalibration
    const startNightCountdown = () => {
      const curTime = new Date();

      const msToNight = Math.abs(curTime - this.nightTime);
      this.nightTimerId = setTimeout(() => this.emit('night'), msToNight);

      const msToNightWarning = msTonight - this.warningTime;
      if (msToNightWarning > 1000) this.nightWarningTimerId = setTimeout(() =>
        this.emit('nightWarning'), msToNightWarning);

      let tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0); tomorrow.setMinutes(0); tomorrow.setSeconds(0);
      const msToSwitchover = Math.abs(curTime - tomorrow);
      this.daySwitchoverTimerId = setTimeout(() =>
        this.switchoverDay(), msToSwitchover);
    };

    this.checkIntervalId = setInterval(() => {
      const curTimeMs = Date.now();
      if (+this.dayTime - curTimeMs <= countdownThreshold)
        startDayCountdown();
      else if (+this.nightTime - curTimeMs <= countdownThreshold)
        startNightCountdown();
    },
    // check twice as often as the threshold
    Math.floor(countdownThreshold / 2));
  }

  /**
    @name switchoverDay
    @desc switchoverDay is called at midnight, extracting the transition
      times from the original times
  **/
  switchoverDay() {
    let dayHours = this.dayTime.getHours();
    let dayMinutes = this.dayTime.getMinutes();

    let dayTime = new Date();
    dayTime.setHours(dayHours); dayTime.setMinutes(dayMinutes);
    dayTime.setSeconds(0); dayTime.setMilliseconds(0);
    this.dayTime = dayTime;

    let nightHours = this.nightTime.getHours();
    let nightMinutes = this.nightTime.getMinutes();

    let nightTime = new Date();
    nightTime.setHours(nightHours); nightTime.setMinutes(nightMinutes);
    nightTime.setSeconds(0); nightTime.setMilliseconds(0);
    this.nightTime = nightTime;

    this.setTimers();
  }

  snooze(evt, interval) {
    if (evt === 'day')
      this.dayTimerId = setTimeout(() => this.emit('day'), interval);
    else if (evt === 'night')
      this.nightTimerId = setTimeout(() => this.emit('night'), interval);
  }

  dispose() {
    clearInterval(this.checkIntervalId);
    clearTimeout(this.dayTimerId);
    clearTimeout(this.dayWarningTimerId);
    clearTimeout(this.nightTimerId);
    clearTimeout(this.nightWarningTimerId);
    clearTimeout(this.daySwithoverTimerId);
  }
}
