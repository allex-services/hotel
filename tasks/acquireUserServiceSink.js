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
    this.acquiredDestroyListener = null;
  }
  lib.inherit(AcquireUserServiceSinkTask,SinkTask);
  AcquireUserServiceSinkTask.prototype.__cleanUp = function () {
    if (this.acquiredDestroyListener) {
      this.acquiredDestroyListener.destroy();
    }
    this.acquiredDestroyListener = null;
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
    console.log('got the record',record);
    this.sink.subConnect(record.name,{name:record.name,role:record.role},{}).done(
      this.onAcquired.bind(this),
      this.onAcquireFailed.bind(this)
    );
  };
  AcquireUserServiceSinkTask.prototype.onAcquired = function(sink){
    console.log('onAcquired',arguments);
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
