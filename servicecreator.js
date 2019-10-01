function createHotelService(execlib,ParentService){
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

  function HotelService(prophash){
    //prophash.usermodule shoud be set through allexlanmanager's needs
    if (!(prophash&&prophash.usermodule)) {
      throw new lib.Error('NO_USERMODULE_IN_PROPERTYHASH','HotelService propertyhash misses the usermodule hash (with namespace and/or basename fields)');
    }
    ParentService.call(this,prophash);
    RemoteServiceListenerServiceMixin.call(this);
    this.usermodule = prophash.usermodule;
    this.userprophash = prophash.userpropertyhash;
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
      this.findRemote(prophash.resolvername, prophash.resolveridentity || null, 'Resolver');
    }
  }
  ParentService.inherit(HotelService,factoryCreator,require('./storagedescriptor'));
  RemoteServiceListenerServiceMixin.addMethods(HotelService);

  HotelService.prototype.__cleanUp = function(){
    this.supersink = null;
    this.clusterOutPath = null;
    this.userprophash = null;
    this.usermodule = null;
    RemoteServiceListenerServiceMixin.prototype.destroy.call(this);
    ParentService.prototype.__cleanUp.call(this);
  };
  HotelService.prototype._deleteFilterForRecord = function (sinkinstancename, record) {
    return {
      op:'eq',
      field:'profile_username',
      value:sinkinstancename
    };
  };
  HotelService.prototype.onSuperSink = function(supersink){
    this.supersink = supersink;
    return ParentService.prototype.onSuperSink.call(this, supersink);
  };
  HotelService.prototype.createStorage = function(storagedescriptor){
    return ParentService.prototype.createStorage.call(this,storagedescriptor);
  };
  HotelService.prototype.clusterDependentRemotePath = function (path) {
    if (this.clusterOutPath) {
      if (!lib.isArray(path)) {
        return this.clusterOutPath.concat([path]);
      } else {
        return this.clusterOutPath.concat(path);
      }
    }
    return path;
  };

  HotelService.prototype.tellApartment = function (apartmentname, method, args) {
    var apartmentsink = this.subservices.get(apartmentname);
    if (!apartmentsink) {
      return q.reject(new lib.Error('NO_APARTMENT_FOUND', apartmentname));
    }
    return apartmentsink.call.apply(apartmentsink, [method].concat(args));
  };

  HotelService.prototype.executeOnResolver = execSuite.dependentServiceMethod([], ['Resolver'], function (rs, methodname_with_args, defer) {
    qlib.promise2defer (rs.call.apply(rs, methodname_with_args), defer);
  });

  HotelService.prototype.logout = function (username) {
    var uss = this.subservices.get(username);
    if (uss) {
      uss.destroy();
      return q(true);
    }
    return q.reject (new lib.Error('USERNAME_NOT_FOUND_TO_LOGOUT', username));
  };

  HotelService.prototype.outerName2ApartmentName = function (outername) {
    return outername;
  };

  HotelService.prototype.apartmentName2OuterName = function (apartmentname) {
    return apartmentname;
  };

  return HotelService;
}

module.exports = createHotelService;
