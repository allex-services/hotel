function createUsersService(execlib,ParentService){
  'use strict';
  var lib = execlib.lib,
      q = lib.q,
      qlib = lib.qlib,
      execSuite = execlib.execSuite,
      RemoteServiceListenerServiceMixin = execSuite.RemoteServiceListenerServiceMixin,
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
    RemoteServiceListenerServiceMixin.call(this);
    this.usermodule = prophash.usermodule;
    this.clusterOutPath = null;
    this.supersink = null;

    if (prophash.clusteroutpath) {
      if (!lib.isArray(prophash.clusteroutpath)) {
        this.clusterOutPath = [{name: prophash.clusteroutpath, identity: {name: 'user', role: 'user'}}];
      } else {
        this.clusterOutPath = prophash.clusteroutpath;
      }
    }

    if (prophash.resolvername) {
      console.log('ocem li ga potraziti?', prophash.resolvername);
      this.findRemote(prophash.resolvername, prophash.resolveridentity || null, 'Resolver');
    }
  }
  ParentService.inherit(UsersService,factoryCreator,require('./storagedescriptor'));
  RemoteServiceListenerServiceMixin.addMethods(UsersService);

  UsersService.prototype.__cleanUp = function(){
    this.usermodule = null;
    this.clusterOutPath = null;
    this.supersink = null;
    RemoteServiceListenerServiceMixin.prototype.destroy.call(this);
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
  UsersService.prototype.clusterDependentRemotePath = function (path) {
    if (this.clusterOutPath) {
      if (!lib.isArray(path)) {
        return this.clusterOutPath.concat([path]);
      } else {
        return this.clusterOutPath.concat(path);
      }
    }
    return path;
  };

  UsersService.prototype.tellApartment = function (apartmentname, method, args) {
    var apartmentsink = this.subservices.get(apartmentname);
    if (!apartmentsink) {
      return q.reject(new lib.Error('NO_APARTMENT_FOUND', apartmentname));
    }
    return apartmentsink.call.apply(apartmentsink, [method].concat(args));
  };

  UsersService.prototype.executeOnResolver = execSuite.dependentServiceMethod([], ['Resolver'], function (rs, methodname_with_args, defer) {
    qlib.promise2defer (rs.call.apply(rs, methodname_with_args), defer);
  });
  return UsersService;
}

module.exports = createUsersService;
