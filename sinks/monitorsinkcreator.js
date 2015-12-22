function createMonitorSink(execlib, ParentSink) {
  'use strict';
  if (!ParentSink) {
    ParentSink = execlib.execSuite.registry.get('.').SinkMap.get('user');
  }

  function MonitorSink(prophash, client) {
    ParentSink.call(this, prophash, client);
  }
  
  ParentSink.inherit(MonitorSink, require('../methoddescriptors/monitoruser'), require('../visiblefields/monitoruser'),require('../storagedescriptor'));
  MonitorSink.prototype.__cleanUp = function () {
    ParentSink.prototype.__cleanUp.call(this);
  };
  return MonitorSink;
}

module.exports = createMonitorSink;
