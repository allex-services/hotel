function createUsersService(execlib,ParentServicePack){
  'use strict';
  var lib = execlib.lib,
      ParentService = ParentServicePack.Service,
      dataSuite = execlib.dataSuite;

  function factoryCreator(parentFactory){
    return {
      'service': require('./users/serviceusercreator')(execlib,parentFactory.get('service')),
      'user': require('./users/usercreator')(execlib,parentFactory.get('user')) 
    };
  }

  function UsersService(prophash){
    //prophash.modulename shoud be set through allexlanmanager's needs
    ParentService.call(this,prophash);
    this.supersink = null;
  }
  ParentService.inherit(UsersService,factoryCreator,require('./storagedescriptor'));
  UsersService.prototype.__cleanUp = function(){
    this.supersink = null;
    ParentService.prototype.__cleanUp.call(this);
  };
  UsersService.prototype.preProcessUserHash = function (userhash) {
    if (userhash && userhash.role === 'user' && userhash.profile) {
      userhash.profile = {
        name: userhash.name,
        role: userhash.role,
        profile: userhash.profile
      };
    }
    ParentService.prototype.preProcessUserHash.call(this, userhash);
  };
  UsersService.prototype.onSuperSink = function(supersink){
    this.supersink = supersink;
  };
  UsersService.prototype.createStorage = function(storagedescriptor){
    return ParentService.prototype.createStorage.call(this,storagedescriptor);
  };
  return UsersService;
}

module.exports = createUsersService;
