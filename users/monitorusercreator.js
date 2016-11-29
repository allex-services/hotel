function createMonitorUser(execlib, ParentUser) {
  'use strict';
  if (!ParentUser) {
    ParentUser = execlib.execSuite.ServicePack.Service.prototype.userFactory.get('user');
  }

  var lib = execlib.lib,
    qlib = lib.qlib;

  function MonitorUser(prophash) {
    ParentUser.call(this, prophash);
    lib.runNext(this.doStats.bind(this));
  }
  
  ParentUser.inherit(MonitorUser, require('../methoddescriptors/monitoruser'), [/*visible state fields here*/]/*or a ctor for StateStream filter*/, require('../visiblefields/monitoruser'));
  MonitorUser.prototype.__cleanUp = function () {
    ParentUser.prototype.__cleanUp.call(this);
  };
  MonitorUser.prototype.tellApartment = function (apartmentname, method, args, defer) {
    qlib.promise2defer(this.__service.tellApartment(apartmentname, method, args), defer);
  };
  MonitorUser.prototype.doStats = function () {
    if (!this.__service) {
      return;
    }
    this.state.set('usercount', this.__service.subservices._instanceMap.count);
    lib.runNext(this.doStats.bind(this), 10*lib.intervals.Second);
  };
  MonitorUser.prototype.role = 'monitor';

  return MonitorUser;
}

module.exports = createMonitorUser;
