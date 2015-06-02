function createUsersServiceTester(execlib,Tester){
  var lib = execlib.lib,
      q = lib.q;

  function UsersServiceTester(prophash,client){
    Tester.call(this,prophash,client);
    console.log('runNext finish');
    lib.runNext(this.finish.bind(this,0));
  }
  lib.inherit(UsersServiceTester,Tester);

  return UsersServiceTester;
}

module.exports = createUsersServiceTester;
