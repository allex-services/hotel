function createServicePack(execlib){
  'use strict';
  return {
    service: {
      dependencies: ['allex:servicecontainer']
    },
    sinkmap: {
      dependencies: ['allex:servicecontainer']
    },
    tasks: {
      dependencies: []
    }
  };
  var lib = execlib.lib,
    q = lib.q,
    d = q.defer(),
    execSuite = execlib.execSuite;

  execSuite.registry.register('allex_servicecontainerservice').done(
    realCreator.bind(null, d),
    d.reject.bind(d)
  );

  function realCreator(defer, ParentServicePack){
    var ret = require('./clientside')(execlib, ParentServicePack);
    ret.Service = require('./servicecreator')(execlib,ParentServicePack);
    defer.resolve(ret);
    /*
    defer.resolve({
      Service: require('./servicecreator')(execlib,ParentServicePack),
      SinkMap: require('./sinkmapcreator')(execlib,ParentServicePack)
    });
    */
  }

  return d.promise;
}

module.exports = createServicePack;
