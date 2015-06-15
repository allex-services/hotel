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
    prophash.modulename = 'allex_userservice';
    ParentService.call(this,prophash);
    this.supersink = null;
    this.reservations = new lib.Map;
  }
  ParentService.inherit(UsersService,factoryCreator,require('./storagedescriptor'));
  UsersService.prototype.__cleanUp = function(){
    if(!this.reservations){
      return;
    }
    this.reservations.destroy();
    this.reservations = null;
    this.supersink = null;
    ParentService.prototype.__cleanUp.call(this);
  };
  UsersService.prototype.preProcessUserHash = function(userhash){
    if(userhash.role==='user'){
      var username = userhash.name;
      userhash.filter = {
        op: 'eq',
        field: 'name',
        value: username
      };
      var us = this.subservices.get(username);
      if(!us){
        var ur = this.reservations.get(username);
        if(!ur){
          this.reservations.add(username,true);
          this.supersink.call('spawn',userhash).done(
            this.onSpawnCleanup.bind(this,username),
            this.onSpawnCleanup.bind(this,username)
          );
        }
      }
    }
    ParentService.prototype.preProcessUserHash.call(this,userhash);
  };
  UsersService.prototype.onSuperSink = function(supersink){
    this.supersink = supersink;
  };
  UsersService.prototype.createStorage = function(storagedescriptor){
    return ParentService.prototype.createStorage.call(this,storagedescriptor);
  };
  UsersService.prototype.onSpawnCleanup = function(username){
    this.reservations.remove(username);
    var u = this.users.get(username);
    if(u){
      u.destroy();
    }
  }
  return UsersService;
}

module.exports = createUsersService;
