function createServiceUser(execlib,ParentUser){
  'use strict';

  if(!ParentUser){
    ParentUser = execlib.execSuite.ServicePack.Service.prototype.userFactory.get('user');
  }

  function ServiceUser(prophash){
    ParentUser.call(this,prophash);
  }
  ParentUser.inherit(ServiceUser,require('../methoddescriptors/serviceuser'),[/*visible state fields here*/]/*or a ctor for StateStream filter*/,require('../visiblefields/serviceuser'));
  ServiceUser.prototype.__cleanUp = function(){
    ParentUser.prototype.__cleanUp.call(this);
  };
  ServiceUser.prototype._instanceNameFromRecord = function(record){
    return record.get('name');
  };
  ServiceUser.prototype._onSinkAcquired = function (defer, record, sink) {
    if(record.globalsettingsdirsink){
      record.globalsettingsdirsink = null;
    }
    ParentUser.prototype._onSinkAcquired.call(this, defer, record, sink);
  };

  return ServiceUser;
}

module.exports = createServiceUser;
