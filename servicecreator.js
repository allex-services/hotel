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
    //prophash.usermodule shoud be set through allexlanmanager's needs
    if (!(prophash&&prophash.usermodule)) {
      throw new lib.Error('NO_USERMODULE_IN_PROPERTYHASH','UsersService propertyhash misses the usermodule hash (with namespace and/or basename fields)');
    }
    ParentService.call(this,prophash);
    this.usermodule = prophash.usermodule;
    this.supersink = null;
  }
  ParentService.inherit(UsersService,factoryCreator,require('./storagedescriptor'));
  UsersService.prototype.__cleanUp = function(){
    this.usermodule = null;
    this.supersink = null;
    ParentService.prototype.__cleanUp.call(this);
  };
  UsersService.prototype.preProcessUserHash = function (userhash) {
    if (userhash && userhash.role === 'user') {
      userhash.filter = {op:'eq', field: 'profile_username', value: userhash.name};
      if (!userhash.profile) {
        userhash.role = null;
        userhash.name = null;
      }
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
