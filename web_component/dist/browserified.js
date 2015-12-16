(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
ALLEX.execSuite.registry.add("allex_usersservice",require('./clientside')(ALLEX, ALLEX.execSuite.registry.get('allex_servicecollectionservice')));

},{"./clientside":2}],2:[function(require,module,exports){
function createClientSide(execlib, ParentServicePack) {
  'use strict';
  return {
    SinkMap: require('./sinkmapcreator')(execlib, ParentServicePack),
    Tasks: [{
      name: 'acquireUserServiceSink',
      klass: require('./tasks/acquireUserServiceSink')(execlib)
    }]
  };
}

module.exports = createClientSide;

},{"./sinkmapcreator":5,"./tasks/acquireUserServiceSink":9}],3:[function(require,module,exports){
module.exports = {
  'logout': [{
    title: 'Username',
    type: 'string'
  }]
};

},{}],4:[function(require,module,exports){
module.exports = {
};

},{}],5:[function(require,module,exports){
function sinkMapCreator(execlib,ParentServicePack){
  'use strict';
  var sinkmap = new (execlib.lib.Map), ParentSinkMap = ParentServicePack.SinkMap;
  sinkmap.add('service',require('./sinks/servicesinkcreator')(execlib,ParentSinkMap.get('service')));
  sinkmap.add('user',require('./sinks/usersinkcreator')(execlib,ParentSinkMap.get('user')));
  
  return sinkmap;
}

module.exports = sinkMapCreator;

},{"./sinks/servicesinkcreator":6,"./sinks/usersinkcreator":7}],6:[function(require,module,exports){
function createServiceSink(execlib,ParentSink){
  'use strict';

  if(!ParentSink){
    ParentSink = execlib.execSuite.registry.get('.').SinkMap.get('user');
  }

  function ServiceSink(prophash,client){
    ParentSink.call(this,prophash,client);
  }
  ParentSink.inherit(ServiceSink,require('../methoddescriptors/serviceuser'),require('../visiblefields/serviceuser'),require('../storagedescriptor'));
  ServiceSink.prototype.__cleanUp = function(){
    ParentSink.prototype.__cleanUp.call(this);
  };
  return ServiceSink;
}

module.exports = createServiceSink;

},{"../methoddescriptors/serviceuser":3,"../storagedescriptor":8,"../visiblefields/serviceuser":10}],7:[function(require,module,exports){
function createUserSink(execlib,ParentSink){
  'use strict';

  if(!ParentSink){
    ParentSink = execlib.execSuite.registry.get('.').SinkMap.get('user');
  }

  function UserSink(prophash,client){
    ParentSink.call(this,prophash,client);
  }
  ParentSink.inherit(UserSink,require('../methoddescriptors/user'),require('../visiblefields/user'),require('../storagedescriptor'));
  UserSink.prototype.__cleanUp = function(){
    ParentSink.prototype.__cleanUp.call(this);
  };
  return UserSink;
}

module.exports = createUserSink;

},{"../methoddescriptors/user":4,"../storagedescriptor":8,"../visiblefields/user":11}],8:[function(require,module,exports){
module.exports = {
  record:{
    primaryKey: 'profile_username',
    fields:[{
      name: 'profile_username'
    },{
      name: 'profile_role'
    }]
  }
};

},{}],9:[function(require,module,exports){
function createAcquireUserServiceSink(execlib){
  'use strict';
  var lib = execlib.lib,
    q = lib.q,
    execSuite = execlib.execSuite,
    SinkTask = execSuite.SinkTask,
    taskRegistry = execSuite.taskRegistry;

  function AcquireUserServiceSinkTask(prophash) {
    SinkTask.call(this,prophash);
    this.sink = prophash.sink;
    this.cb = prophash.cb;
    this.propertyhash = prophash.propertyhash || {};
    this.acquiredDestroyListener = null;
  }
  lib.inherit(AcquireUserServiceSinkTask,SinkTask);
  AcquireUserServiceSinkTask.prototype.__cleanUp = function () {
    if (this.acquiredDestroyListener) {
      this.acquiredDestroyListener.destroy();
    }
    this.acquiredDestroyListener = null;
    this.propertyhash = null;
    this.cb = null;
    this.sink = null;
    SinkTask.prototype.__cleanUp.call(this);
  };
  AcquireUserServiceSinkTask.prototype.go = function () {
    taskRegistry.run('materializeData', {
      sink: this.sink,
      data: [],
      onRecordCreation: this.onRecordCreated.bind(this)
    });
  };
  AcquireUserServiceSinkTask.prototype.onRecordCreated = function (record) {
    this.sink.subConnect(record.profile_username,{name:record.profile_username,role:'user'},this.propertyhash).done(
      this.onAcquired.bind(this),
      this.onAcquireFailed.bind(this)
    );
  };
  AcquireUserServiceSinkTask.prototype.onAcquired = function(sink){
    if (this.acquiredDestroyListener) {
      this.acquiredDestroyListener.destroy();
    }
    this.acquiredDestroyListener = sink.destroyed.attach(this.onAcquiredSinkDown.bind(this));
    this.cb(sink);
  };
  AcquireUserServiceSinkTask.prototype.onAcquireFailed = function (reason) {
    console.log('onAcquireFailed',arguments);
  };
  AcquireUserServiceSinkTask.prototype.onAcquiredSinkDown = function () {
    this.cb(null);
  };
  AcquireUserServiceSinkTask.prototype.compulsoryConstructionProperties = ['sink', 'cb'];

  return AcquireUserServiceSinkTask;
}

module.exports = createAcquireUserServiceSink;

},{}],10:[function(require,module,exports){
module.exports = ['profile_username', 'profile_role'];

},{}],11:[function(require,module,exports){
arguments[4][10][0].apply(exports,arguments)
},{"dup":10}]},{},[1]);
