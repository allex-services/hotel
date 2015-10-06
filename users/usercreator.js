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
  function spawnDescriptorWriter(desc, item, itemname) {
    desc['profile_'+itemname] = item;
  }
  function userProfile2SpawnDescriptor(profile) {
    var ret = {};
    lib.traverseShallow(profile, spawnDescriptorWriter.bind(null, ret));
    return ret;
  }
  ParentUser.inherit(User,require('../methoddescriptors/user'),[/*visible state fields here*/]/*or a ctor for StateStream filter*/,require('../visiblefields/user'));
  User.prototype.doTheSpawn = function (prophash) {
    if (prophash.profile) {
      this.__service.supersink.call('spawn',userProfile2SpawnDescriptor(prophash.profile));
    } else {
      lib.runNext(this.destroy.bind(this));
    }
  };

  return User;
}

module.exports = createUser;
