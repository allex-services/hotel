function createHotelUserTester(execlib,Tester){
  'use strict';
  var lib = execlib.lib,
      q = lib.q;

  function HotelUserTester(prophash,client){
    Tester.call(this,prophash,client);
    console.log('runNext finish');
    lib.runNext(this.finish.bind(this,0));
  }
  lib.inherit(HotelUserTester,Tester);

  return HotelUserTester;
}

module.exports = createHotelUserTester;
