function createMonitorUser(execlib, ParentUser) {
  'use strict';
  if (!ParentUser) {
    ParentUser = execlib.execSuite.ServicePack.Service.prototype.userFactory.get('user');
  }

  var lib = execlib.lib,
    qlib = lib.qlib;

  function MonitorUser(prophash) {
    ParentUser.call(this, prophash);
  }
  
  ParentUser.inherit(MonitorUser, require('../methoddescriptors/monitoruser'), [/*visible state fields here*/]/*or a ctor for StateStream filter*/, require('../visiblefields/monitoruser'));
  MonitorUser.prototype.__cleanUp = function () {
    ParentUser.prototype.__cleanUp.call(this);
  };
  MonitorUser.prototype.tellApartment = function (apartmentname, method, args, defer) {
    qlib.promise2defer(this.__service.tellApartment(apartmentname, method, args), defer);
  };
  MonitorUser.prototype.role = 'monitor';

  return MonitorUser;
}

module.exports = createMonitorUser;
