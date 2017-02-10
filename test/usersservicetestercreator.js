function createHotelServiceTester(execlib,Tester){
  'use strict';
  var lib = execlib.lib,
      q = lib.q;

  function HotelServiceTester(prophash,client){
    Tester.call(this,prophash,client);
    console.log('runNext finish');
    lib.runNext(this.finish.bind(this,0));
  }
  lib.inherit(HotelServiceTester,Tester);

  return HotelServiceTester;
}

module.exports = createHotelServiceTester;
