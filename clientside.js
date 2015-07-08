function createClientSide(execlib, ParentServicePack) {
  'use strict';
  return {
    SinkMap: require('./sinkmapcreator')(execlib, ParentServicePack),
    Tasks: [{
      name: 'acquireUserServiceSink',
      klass: require('./tasks/acquireUserServiceSink')(execlib)
    }]
  };
}

module.exports = createClientSide;
