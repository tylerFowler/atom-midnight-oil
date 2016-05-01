'use babel';

import { CompositeDisposable } from 'atom';
import TimeEmitter from './timeEmitter';

export default {
  subscriptions: null,
  config: require('./config.json'),
  snoozeTime: 5 * 60 * 1000,

  activate() {
    this.subscriptions = new CompositeDisposable();

    let nightTime = atom.config.get('midnight-oil.nightTime')
      || this.config.nightTime.default;

    let dayTime = atom.config.get('midnight-oil.dayTime')
       || this.config.dayTime.default;

    try {
      let nightTriggerTime = this.parseTime(nightTime, true);
      let dayTriggerTime = this.parseTime(dayTime, false);

      // check what time of day we're in on startup & set theme accordingly
      let timeOfDay = new Date() < nightTriggerTime ? 'day' : 'night';
      switch (timeOfDay) {
      case 'day': this.setToDayTheme(); break;
      case 'night': this.setToNightTheme(); break;
      default: break;
      }

      this.timeEmitter = new TimeEmitter(dayTriggerTime, nightTriggerTime);
      this.subscriptions.add(this.timeEmitter);
    } catch (err) {
      atom.notifications.addError('Could not start midnight-oil', {
        detail: err.toString()
      });

      return this.deactivate();
    }

    this.timeEmitter.on('day', this.handleDayTransition);
    this.timeEmitter.on('night', this.handleNightTransation);
  },

  shouldSnooze(transitionType) {
    return atom.confirm({
      message: `Switching to ${transitionType} theme`,
      buttons: [ 'Snooze', 'Switch' ]
    }) === 0;
  },

  handleDayTransition() {
    if (this.shouldSnooze('day'))
      this.timeEmitter.snooze('day', this.snoozeTime);
    else this.setToDayTheme();
  },

  handleNightTransition() {
    if (this.shouldSnooze('night'))
      this.timeEmitter.snooze('night', this.snoozeTime);
    else this.setToNightTheme();
  },

  /**
    @name parseTime
    @desc parses a time string in the format hours:minutes
    @param {string} timeStr
    @param {boolean} isPM
    @throws Error if time string is invalid
    @returns {date}
  **/
  parseTime(timeStr, isPM) {
    let { hoursStr, minutesStr } = timeStr.split(':');
    let hours = parseInt(hoursStr, 10);
    let minutes = parseInt(minutesStr, 10);

    if (hours.toString() === 'NaN' || minutes.toString() === 'NaN')
      throw new Error(`Invalid time ${hoursStr}:${minutesStr}`);

    // support using a 12 hour time
    if (isPM)
      hours = hours + 12 > 24 ? hours : hours + 12;

    let dt = new Date();
    dt.setHours(hours); dt.setMinutes(minutes);
    dt.setSeconds(0); dt.setMilliseconds(0);

    return dt;
  },

  setToDayTheme() {
    let curThemes = atom.config.get('core.themes');
    let uiTheme = atom.config.get('midnight-oil.dayTheme')
      || this.config.dayTheme.default;

    let syntaxTheme = atom.config.get('midnight-oil.daySyntax')
      || this.config.daySyntax.default;

    if (!(curThemes[0] === uiTheme && curThemes[1] === syntaxTheme))
      atom.config.set('core.themes', [ uiTheme, syntaxTheme ]);
  },

  setToNightTheme() {
    let curThemes = atom.config.get('core.themes');
    let uiTheme = atom.config.get('midnight-oil.nightTheme')
      || this.config.nightTheme.default;

    let syntaxTheme = atom.config.get('midnight-oil.nightSyntax')
      || this.config.nightSyntax.default;

    if (!(curThemes[0] === uiTheme && curThemes[1] === syntaxTheme))
      atom.config.set('core.themes', [ uiTheme, syntaxTheme ]);
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  toggle() {
    console.log('MidnightOil was toggled!');
  }
};
