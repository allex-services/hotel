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
