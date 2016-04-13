function createUser(execlib,ParentUser){
  'use strict';
  var lib = execlib.lib,
    q = lib.q;

  if(!ParentUser){
    ParentUser = execlib.execSuite.ServicePack.Service.prototype.userFactory.get('user');
  }

  function User(prophash){
    ParentUser.call(this,prophash);
    this.apartmentDestroyedListener = null;
    this.doTheSpawn(prophash);
  }
  ParentUser.inherit(User,require('../methoddescriptors/user'),[/*visible state fields here*/]/*or a ctor for StateStream filter*/,require('../visiblefields/user'));
  User.prototype.__cleanUp = function () {
    if (this.apartmentDestroyedListener) {
      this.apartmentDestroyedListener.destroy();
    }
    this.apartmentDestroyedListener = null;
    ParentUser.prototype.__cleanUp.call(this);
  };
  User.prototype.doTheSpawn = function (prophash) {
    this.__service.supersink.call('spawn',prophash).then(
      this.onSpawned.bind(this),
      this.destroy.bind(this)
    );
  };
  User.prototype.onSpawned = function (sink) {
    //console.log('user spawned', sink);
    if (!(sink && sink.destroyed)) {
      this.destroy();
    } else {
      this.apartmentDestroyedListener = sink.destroyed.attach(this.destroy.bind(this));
    }
  };
  User.prototype.waitForApartment = function (defer) {
    var name;
    if (!this.__service) {
      defer.reject(new lib.Error('SERVICE_DOWN', 'Service is down'));
      return;
    }
    if (!this.state) {
      defer.reject(new lib.Error('ALREADY_DEAD'));
      return;
    }
    name = this.get('name');
    if (!name) {
      defer.reject(new lib.Error('NO_APARTMENT_NAME_TO_FIND'));
      return;
    }
    console.log('will wait for subservice', name);
    this.__service.subservices.listenFor(name, defer.resolve.bind(defer, name), true, true);
  };

  return User;
}

module.exports = createUser;
