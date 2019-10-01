function createServiceUser(execlib,ParentUser){
  'use strict';
  var lib = execlib.lib,
    q = lib.q,
    qlib = lib.qlib,
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
  ServiceUser.prototype.acquireSink = function(spawnrecord, spawndescriptor){
    var usermodulename;
    if(!this.__service.usermodule){
      return q.reject(new lib.Error('SERVICE_DOWN'));
    }
    usermodulename = this.userModuleName(spawndescriptor);
    if (!usermodulename) {
      return q.reject(new lib.Error('LOGIN_NOT_ALLOWED', 'No apartment modulename for '+JSON.stringify(spawndescriptor)));
    }
    spawndescriptor.__hotel = this.__service;
    return execSuite.start({
      service:{
        modulename: usermodulename,
        instancename: this.__service.global ? spawndescriptor.instancename : null,
        propertyhash: spawndescriptor
      }
    });
  };
  ServiceUser.prototype._instanceNameFromRecord = function(record){
    return record.get('profile_username');
  };
  ServiceUser.prototype._spawnDescriptorToRecord = function (spawndescriptor) {
    return ParentUser.prototype._spawnDescriptorToRecord.call(this,this.exposedUserRecord(spawndescriptor));
  };
  ServiceUser.prototype.exposedUserRecord = function (spawndescriptor) {
    if (!(spawndescriptor && spawndescriptor.profile)) {
      return {
        profile_username: '',
        profile_role: ''
      };
    }
    return {
      profile_username: spawndescriptor.profile.username,
      profile_role: spawndescriptor.profile.role
    };
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
    qlib.promise2defer(this.__service.logout(username), defer);
  };

  return ServiceUser;
}

module.exports = createServiceUser;
