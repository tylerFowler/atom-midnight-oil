'use babel';

import { CompositeDisposable } from 'atom';
import TimeEmitter from './timeEmitter';

export default {
  subscriptions: null,
  config: require('./config.json'),
  snoozeTime: 5 * 60 * 1000, // TODO: add snooze time as config value

  activate() {
    // TODO: this can add ~450ms to startup time, but it usually takes ~5-8ms
    // investigation required (it's not when we detect the wrong theme for
    // time of day and correct it)
    this.subscriptions = new CompositeDisposable();

    let nightTime = atom.config.get('midnight-oil.nightTime')
      || this.config.nightTime.default;

    let dayTime = atom.config.get('midnight-oil.dayTime')
       || this.config.dayTime.default;

    try {
      let nightTriggerTime = this.parseTime(nightTime, true);
      let dayTriggerTime = this.parseTime(dayTime, false);

      // check what time of day we're in on startup & set theme accordingly
      let curTime = new Date();
      let timeOfDay = curTime > dayTriggerTime && curTime < nightTriggerTime ?
        'day' : 'night';

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

    this.timeEmitter.on('day', this.handleDayTransition.bind(this));
    this.timeEmitter.on('dayWarning', this.showWarning.bind(null, 'day'));

    this.timeEmitter.on('night', this.handleNightTransition.bind(this));
    this.timeEmitter.on('nightWarning', this.showWarning.bind(null, 'night'));
  },

  shouldSnooze(transitionType) {
    return atom.confirm({
      message: `Switching to ${transitionType} theme`,
      buttons: [ 'Switch', 'Snooze' ]
    }) > 0;
  },

  showWarning(transitionType) {
    atom.notifications
    .addWarning(`Switching to ${transitionType} theme in 5 minutes`);
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
    let [ hoursStr, minutesStr ] = timeStr.split(':');
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

    let shouldSwitchTheme = atom.config.get('midnight-oil.switchTheme');

    if (shouldSwitchTheme === undefined)
      shouldSwitchTheme = this.config.switchTheme.default;

    // if should with theme is off then just use the current UI theme
    if (!shouldSwitchTheme && curThemes[1] !== syntaxTheme)
      return atom.config.set('core.themes', [ curThemes[0], syntaxTheme ]);

    if (!(curThemes[0] === uiTheme || curThemes[1] === syntaxTheme))
      atom.config.set('core.themes', [ uiTheme, syntaxTheme ]);
  },

  setToNightTheme() {
    let curThemes = atom.config.get('core.themes');
    let uiTheme = atom.config.get('midnight-oil.nightTheme')
      || this.config.nightTheme.default;

    let syntaxTheme = atom.config.get('midnight-oil.nightSyntax')
      || this.config.nightSyntax.default;

    let shouldSwitchTheme = atom.config.get('midnight-oil.switchTheme');

    if (shouldSwitchTheme === undefined)
      shouldSwitchTheme = this.config.switchTheme.default;

    // if should with theme is off then just use the current UI theme
    if (!shouldSwitchTheme && curThemes[1] !== syntaxTheme)
      return atom.config.set('core.themes', [ curThemes[0], syntaxTheme ]);

    if (!(curThemes[0] === uiTheme || curThemes[1] === syntaxTheme))
      atom.config.set('core.themes', [ uiTheme, syntaxTheme ]);
  },

  deactivate() {
    this.subscriptions.dispose();
  }
};
