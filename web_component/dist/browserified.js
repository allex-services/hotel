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

},{"./sinkmapcreator":6,"./tasks/acquireUserServiceSink":11}],3:[function(require,module,exports){
module.exports = {
};

},{}],4:[function(require,module,exports){
module.exports = {
  'logout': [{
    title: 'Username',
    type: 'string'
  }]
};

},{}],5:[function(require,module,exports){
arguments[4][3][0].apply(exports,arguments)
},{"dup":3}],6:[function(require,module,exports){
function sinkMapCreator(execlib,ParentServicePack){
  'use strict';
  var sinkmap = new (execlib.lib.Map), ParentSinkMap = ParentServicePack.SinkMap;
  sinkmap.add('service',require('./sinks/servicesinkcreator')(execlib,ParentSinkMap.get('service')));
  sinkmap.add('user',require('./sinks/usersinkcreator')(execlib,ParentSinkMap.get('user')));
  sinkmap.add('monitor',require('./sinks/monitorsinkcreator')(execlib,ParentSinkMap.get('user')));
  
  return sinkmap;
}

module.exports = sinkMapCreator;

},{"./sinks/monitorsinkcreator":7,"./sinks/servicesinkcreator":8,"./sinks/usersinkcreator":9}],7:[function(require,module,exports){
function createMonitorSink(execlib, ParentSink) {
  'use strict';
  if (!ParentSink) {
    ParentSink = execlib.execSuite.registry.get('.').SinkMap.get('user');
  }

  function MonitorSink(prophash, client) {
    ParentSink.call(this, prophash, client);
  }
  
  ParentSink.inherit(MonitorSink, require('../methoddescriptors/monitoruser'), require('../visiblefields/monitoruser'),require('../storagedescriptor'));
  MonitorSink.prototype.__cleanUp = function () {
    ParentSink.prototype.__cleanUp.call(this);
  };
  return MonitorSink;
}

module.exports = createMonitorSink;

},{"../methoddescriptors/monitoruser":3,"../storagedescriptor":10,"../visiblefields/monitoruser":12}],8:[function(require,module,exports){
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

},{"../methoddescriptors/serviceuser":4,"../storagedescriptor":10,"../visiblefields/serviceuser":13}],9:[function(require,module,exports){
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

},{"../methoddescriptors/user":5,"../storagedescriptor":10,"../visiblefields/user":14}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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
    this.userSinkDestroyedListener = null;
    this.attempts = 0;
  }
  lib.inherit(AcquireUserServiceSinkTask,SinkTask);
  AcquireUserServiceSinkTask.prototype.__cleanUp = function () {
    console.log('AcquireUserServiceSinkTask dying');
    if (this.userSinkDestroyedListener) {
      this.userSinkDestroyedListener.destroy();
    }
    this.userSinkDestroyedListener = null;
    if (this.acquiredDestroyListener) {
      this.acquiredDestroyListener.destroy();
    }
    this.acquiredDestroyListener = null;
    this.propertyhash = null;
    this.cb = null;

    if (this.sink) {
      this.sink.destroy();
    }
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
    this.attempts++;
    console.log('trying to subconnect to my apartment', record.profile_username, '#', this.attempts);
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
    if (!sink) {
      console.log('no sink?');
      this.destroy();
    } else {
      if (this.userSinkDestroyedListener) {
        this.userSinkDestroyedListener.destroy();
      }
      this.userSinkDestroyedListener = sink.destroyed.attach(this.destroy.bind(this));
    }
  };
  AcquireUserServiceSinkTask.prototype.onAcquireFailed = function (reason) {
    console.log('onAcquireFailed',arguments);
    this.destroy();
  };
  AcquireUserServiceSinkTask.prototype.onAcquiredSinkDown = function () {
    this.cb(null);
  };
  AcquireUserServiceSinkTask.prototype.compulsoryConstructionProperties = ['sink', 'cb'];

  return AcquireUserServiceSinkTask;
}

module.exports = createAcquireUserServiceSink;

},{}],12:[function(require,module,exports){
module.exports = ['profile_username', 'profile_role'];

},{}],13:[function(require,module,exports){
arguments[4][12][0].apply(exports,arguments)
},{"dup":12}],14:[function(require,module,exports){
arguments[4][12][0].apply(exports,arguments)
},{"dup":12}]},{},[1]);
