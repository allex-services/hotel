function createServiceUser(execlib,ParentUser){
  'use strict';
  var execSuite = execlib.execSuite;

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
  ServiceUser.prototype.acquireSink = function(spawndescriptor,defer){
    if(!this.__service.usermodule){
      defer.reject('Service is down');
      return;
    }
    execSuite.start({
      service:{
        modulename: this.userModuleName(spawndescriptor),
        instancename: this.__service.global ? spawndescriptor.instancename : null,
        propertyhash: spawndescriptor
      }
    }).done(
      defer.resolve.bind(defer),
      defer.reject.bind(defer),
      defer.notify.bind(defer)
    );
  };
  ServiceUser.prototype._instanceNameFromRecord = function(record){
    return record.get('name');
  };
  ServiceUser.prototype.userModuleName = function (spawndescriptor){
    var ret = 'allex_';
    if(this.__service.usermodule.namespace){
      ret += ('_'+this.__service.usermodule.namespace+'_');
    }
    ret += (this.__service.usermodule.basename||'');
    ret += spawndescriptor.profile.role;
    ret += 'service';
    return ret;
  };

  return ServiceUser;
}

module.exports = createServiceUser;
