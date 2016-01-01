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
  }
  ParentUser.inherit(User,require('../methoddescriptors/user'),[/*visible state fields here*/]/*or a ctor for StateStream filter*/,require('../visiblefields/user'));
  User.prototype.doTheSpawn = function (prophash) {
    var d = this.destroy.bind(this);
    if (prophash.profile) {
      this.__service.supersink.call('spawn',prophash.profile).then(d,d);
    } else {
      lib.runNext(d);
    }
  };

  return User;
}

module.exports = createUser;
