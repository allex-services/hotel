ALLEX.execSuite.registry.registerClientSide("allex_usersservice",require('./sinkmapcreator')(ALLEX, ALLEX.execSuite.registry.getClientSide('allex_servicecollectionservice')));
ALLEX.execSuite.taskRegistry.register("allex_usersservice",require('./taskcreator')(ALLEX));
