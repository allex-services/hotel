# UsersService
AllexJS Service that is a specialization of `allex_servicecollectionservice`.

It creates an instance of a given Service (in `propertyhash.modulename`) per each User logged in - hence its name.

In order to perform its task, it:

1. Intercepts the incoming userhash after successful authentication - in the overriden `Service`'s `preProcessUserHash` method.
2. _If the incoming role is `user`_, in the userhash it inserts the predefined filter that will filter out just the User's personalized Service.
3. `spawn`s the child Service - mapped to the name of the logged-in User.
4. On both the successful and unsuccessful `spawn` the User will be `destroy`ed.
