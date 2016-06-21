function createTasks(execlib) {
  'use strict';
  return [{
    name: 'acquireUserServiceSink',
    klass: require('./tasks/acquireUserServiceSink')(execlib)
  }];
}

module.exports = createTasks;
