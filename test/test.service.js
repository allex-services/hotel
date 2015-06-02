var execlib=require('hers_exectesting')();

execlib.test({
  debug_brk: false,
  debug: false,
  name:'Users',
  modulepath:'./index.js',
  propertyhash: {
  }
},{
  debug_brk: false,
  debug: false,
  tests:[
  {
    count:2,
    role: 'service',
    tester:{
      count:2,
      modulepath:'./test/usersservicetestercreator',
      propertyhash:{
      }
    }
  },
  {
    count:2,
    role: 'user',
    tester:{
      count:2,
      modulepath:'./test/usersusertestercreator',
      propertyhash:{
      }
    }
  } 
  ]
});

