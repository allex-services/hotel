ALLEX.execSuite.registry.registerClientSide("allex_hotelservice",require('./sinkmapcreator')(ALLEX, ALLEX.execSuite.registry.getClientSide('allex_servicecollectionservice')));
ALLEX.execSuite.taskRegistry.register("allex_hotelservice",require('./taskcreator')(ALLEX));
