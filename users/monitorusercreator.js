function createMonitorUser(execlib, ParentUser) {
  'use strict';
  if (!ParentUser) {
    ParentUser = execlib.execSuite.ServicePack.Service.prototype.userFactory.get('user');
  }

  function MonitorUser(prophash) {
    ParentUser.call(this, prophash);
  }
  
  ParentUser.inherit(MonitorUser, require('../methoddescriptors/monitoruser'), [/*visible state fields here*/]/*or a ctor for StateStream filter*/, require('../visiblefields/monitoruser'));
  MonitorUser.prototype.__cleanUp = function () {
    ParentUser.prototype.__cleanUp.call(this);
  };
  MonitorUser.prototype.role = 'monitor';

  return MonitorUser;
}

module.exports = createMonitorUser;
