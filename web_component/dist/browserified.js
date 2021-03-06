(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
ALLEX.execSuite.registry.registerClientSide("allex_hotelservice",require('./sinkmapcreator')(ALLEX, ALLEX.execSuite.registry.getClientSide('allex_servicecollectionservice')));
ALLEX.execSuite.taskRegistry.register("allex_hotelservice",require('./taskcreator')(ALLEX));

},{"./sinkmapcreator":5,"./taskcreator":10}],2:[function(require,module,exports){
module.exports = {
  tellApartment:[{
    title: 'Apartment name',
    type: 'string'
  },{
    title: 'Method',
    type: 'string'
  },{
    title: 'Arguments',
    type: 'array'
  }]
};

},{}],3:[function(require,module,exports){
module.exports = {
  'logout': [{
    title: 'Username',
    type: 'string'
  }]
};

},{}],4:[function(require,module,exports){
module.exports = {
  waitForApartment: true
};

},{}],5:[function(require,module,exports){
function sinkMapCreator(execlib,ParentSinkMap){
  'use strict';
  var sinkmap = new (execlib.lib.Map);
  sinkmap.add('service',require('./sinks/servicesinkcreator')(execlib,ParentSinkMap.get('service')));
  sinkmap.add('user',require('./sinks/usersinkcreator')(execlib,ParentSinkMap.get('user')));
  sinkmap.add('monitor',require('./sinks/monitorsinkcreator')(execlib,ParentSinkMap.get('user')));
  
  return sinkmap;
}

module.exports = sinkMapCreator;

},{"./sinks/monitorsinkcreator":6,"./sinks/servicesinkcreator":7,"./sinks/usersinkcreator":8}],6:[function(require,module,exports){
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

},{"../methoddescriptors/monitoruser":2,"../storagedescriptor":9,"../visiblefields/monitoruser":12}],7:[function(require,module,exports){
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

},{"../methoddescriptors/serviceuser":3,"../storagedescriptor":9,"../visiblefields/serviceuser":13}],8:[function(require,module,exports){
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

},{"../methoddescriptors/user":4,"../storagedescriptor":9,"../visiblefields/user":14}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
function createTasks(execlib) {
  'use strict';
  return [{
    name: 'acquireUserServiceSink',
    klass: require('./tasks/acquireUserServiceSink')(execlib)
  }];
}

module.exports = createTasks;

},{"./tasks/acquireUserServiceSink":11}],11:[function(require,module,exports){
function createAcquireUserServiceSink(execlib){
  'use strict';
  var lib = execlib.lib,
    q = lib.q,
    execSuite = execlib.execSuite,
    SinkTask = execSuite.SinkTask;

  function AcquireUserServiceSinkTask(prophash) {
    SinkTask.call(this,prophash);
    this.sink = prophash.sink;
    this.cb = prophash.cb;
    this.propertyhash = prophash.propertyhash || {};
    this.attempts = 0;
  }
  lib.inherit(AcquireUserServiceSinkTask,SinkTask);
  AcquireUserServiceSinkTask.prototype.__cleanUp = function () {
    //console.log('AcquireUserServiceSinkTask dying');
    this.attempts = null;
    this.propertyhash = null;
    this.cb = null;
    this.sink = null;
    SinkTask.prototype.__cleanUp.call(this);
  };
  AcquireUserServiceSinkTask.prototype.go = function () {
    this.sink.call('waitForApartment').then(
      this.onSelfApartment.bind(this)
    );
  };
  AcquireUserServiceSinkTask.prototype.onSelfApartment = function (selfname) {
    this.attempts++;
    //console.log('trying to subconnect to my apartment', selfname, '#', this.attempts);
    this.sink.subConnect(selfname,{name:selfname,role:'user'},this.propertyhash).done(
      this.onAcquired.bind(this),
      this.onAcquireFailed.bind(this)
    );
  };
  AcquireUserServiceSinkTask.prototype.onAcquired = function(sink){
    if (this.cb && this.sink) {
      if (!sink) {
        console.log('no sink?');
      } else {
        if (sink.destroyed) {
          sink.destroyed.attachForSingleShot(this.sink.destroy.bind(this.sink));
        }
      }
      this.cb(sink);
    }
    this.destroy();
  };
  AcquireUserServiceSinkTask.prototype.onAcquireFailed = function (reason) {
    console.log('onAcquireFailed',arguments);
    if (this.cb) {
      this.cb(null);
    }
    this.destroy();
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
