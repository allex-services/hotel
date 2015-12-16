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
