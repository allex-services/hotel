function createUsersService(execlib,ParentService){
  'use strict';
  var lib = execlib.lib,
      q = lib.q,
      qlib = lib.qlib,
      dataSuite = execlib.dataSuite;

  function factoryCreator(parentFactory){
    return {
      'service': require('./users/serviceusercreator')(execlib,parentFactory.get('service')),
      'user': require('./users/usercreator')(execlib,parentFactory.get('user')) ,
      'monitor': require('./users/monitorusercreator')(execlib,parentFactory.get('user')) 
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
  UsersService.prototype._deleteFilterForRecord = function (sinkinstancename, record) {
    return {
      op:'eq',
      field:'profile_username',
      value:sinkinstancename
    };
  };
  UsersService.prototype.onSuperSink = function(supersink){
    this.supersink = supersink;
  };
  UsersService.prototype.createStorage = function(storagedescriptor){
    return ParentService.prototype.createStorage.call(this,storagedescriptor);
  };
  UsersService.prototype.tellApartment = function (apartmentname, method, args) {
    var apartmentsink = this.subservices.get(apartmentname);
    if (!apartmentsink) {
      return q.reject(new lib.Error('NO_APARTMENT_FOUND', apartmentname));
    }
    return apartmentsink.call.apply(apartmentsink, [method].concat(args));
  };
  return UsersService;
}

module.exports = createUsersService;
