'use strict';


const MonitorSubscription = require('egg').Subscription;
let monitorFlag = false;
class MonitorInterval extends MonitorSubscription {
  async subscribe() {
    if (monitorFlag) {
      monitorFlag = false;
      console.log('monitorFlag', monitorFlag);
    } else {
      monitorFlag = true;
    }
    this.ctx.logger.info('all&&interval');
  }

  static get schedule() {
    return {
      interval: '1h',
      type: 'worker',
    };
  }
}

module.exports = MonitorInterval;
