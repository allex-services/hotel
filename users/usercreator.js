function createUser(execlib,ParentUser){
  'use strict';
  var lib = execlib.lib,
    q = lib.q;

  if(!ParentUser){
    ParentUser = execlib.execSuite.ServicePack.Service.prototype.userFactory.get('user');
  }

  function User(prophash){
    ParentUser.call(this,prophash);
    this.doTheSpawn(prophash);
    this.apartmentDestroyedListener = null;
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
    var stdp = this.startTheDyingProcedure.bind(this);
    if (prophash.profile) {
      this.__service.supersink.call('spawn',prophash.profile).then(
        this.onSpawned.bind(this),
        stdp
      );
    } else {
      lib.runNext(stdp);
    }
  };
  User.prototype.onSpawned = function (sink) {
    //console.log('user spawned', sink);
    if (!(sink && sink.destroyed)) {
      this.startTheDyingProcedure();
    } else {
      this.apartmentDestroyedListener = sink.destroyed.attach(this.startTheDyingProcedure.bind(this));
    }
  };

  return User;
}

module.exports = createUser;
