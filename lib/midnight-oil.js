'use babel';

import { CompositeDisposable } from 'atom';
import TimeEmitter from './timer';

export default {
  subscriptions: null,
  config: require('./config.json'),

  activate(state) {
    this.subscriptions = new CompositeDisposable();

    let nightTime = atom.config.get(
      'midnight-oil.nightTime' || this.config.nightTime.default
    );

    let dayTime = atom.config.get(
      'midnight-oil.dayTime' || this.config.dayTime.default
    );

    try {
      let nightTriggerTime = this.parseTime(nightTime, true);
      let dayTriggerTime = this.parseTime(dayTime, true);

      this.timeEmitter = new TimeEmitter(dayTriggerTime, nightTriggerTime);
      this.subscriptions.add(this.timeEmitter);
    } cath (err) {
      atom.notifications.addError('Could not start midnight-oil', {
        detail: err.toString()
      });

      this.deactivate();
    }

    // Register command that toggles this view
    // this.subscriptions.add(atom.commands.add('atom-workspace', {
    //   'midnight-oil:toggle': () => this.toggle()
    // }));
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
      hours = (hours + 12 > 24) ? hours : hours + 12;

    let dt = new Date();
    dt.setHours(hours); dt.setMinutes(minutes);
    dt.setSeconds(0); dt.setMilliseconds(0);

    return dt;
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  serialize() {
    return {
      midnightOilViewState: this.midnightOilView.serialize()
    };
  },

  toggle() {
    console.log('MidnightOil was toggled!');
  }
};
