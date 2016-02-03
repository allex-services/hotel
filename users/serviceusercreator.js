function createServiceUser(execlib,ParentUser){
  'use strict';
  var lib = execlib.lib,
    q = lib.q,
    execSuite = execlib.execSuite,
    dataSuite = execlib.dataSuite;

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
  ServiceUser.prototype.acquireSink = function(spawnrecord, spawndescriptor, defer){
    console.log('Users will acquireSink', spawndescriptor);
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
    return record.get('profile_username');
  };
  ServiceUser.prototype._spawnDescriptorToRecord = function (spawndescriptor) {
    return ParentUser.prototype._spawnDescriptorToRecord.call(this,{
      profile_username: spawndescriptor.profile.username,
      profile_role: spawndescriptor.profile.role
    });
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
  ServiceUser.prototype.logout = function (username, defer) {
    var uss = this.__service.subservices.get(username);
    if (uss) {
      uss.destroy();
      defer.resolve(true);
    } else {
      defer.reject (new lib.Error('USERNAME_NOT_FOUND_TO_LOGOUT', username));
    }
  };

  return ServiceUser;
}

module.exports = createServiceUser;
