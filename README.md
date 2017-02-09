# UsersService
AllexJS Service that is a specialization of `allex_servicecollectionservice`.

It creates an instance of an appropriate User class (in accordance to
`propertyhash.usermodule.namespace` and `propertyhash.usermodule.basename`)
per each User logged in - hence its name.

In order to perform its task, it:

1. Intercepts the incoming userhash after successful authentication - in the
overriden `Service`'s `preProcessUserHash` method.
2. _If the incoming role is `user`_, in the userhash it inserts the predefined
filter that will filter out just the User's personalized Service.
3. `spawn`s the child Service - mapped to the name of the logged-in User.
4. On both the successful and unsuccessful `spawn` the User will be `destroy`ed.

## Choosing the appropriate User class
`propertyhash` has to have the `usermodule` hash like
```javascript
{...
  usermodule: {
    namespace: 'somenamespace_or_blankstring',
    basename: 'somebasename_of_blankstring'
  }
}
```
When a remote user approaches the UsersService, the `preProcessUserHash` will 

- check for existence of the `profile` key in the provided `userhash`
- if no `profile` is found, the user will be blocked by setting its `name` and
`role` to null
- if `profile` is found, the `role` key within will dictate the process of
constructing the User class name

### if `namespace` exists
`allex__namespace_basenameroleservice

### if `namespace` does not exist
`allex_basenameroleservice

Mind the `namespace`, `basename` and `role` in the above strings. These are
placeholders for the real values of `namespace`, `basename` and `role`.

It is obvious that `basename` _should_ exist for real systems.




