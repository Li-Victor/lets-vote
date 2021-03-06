export default {
  findById(db, id, cb) {
    db.users
      .findOne({
        id
      })
      .then((user) => {
        if (user) cb(null, user);
        else {
          cb(new Error(`User ${id} does not exist.`));
        }
      });
  },

  fbLogin(db, id, displayname, cb) {
    db.users
      .findOne({
        id
      })
      .then((user) => {
        if (user) cb(null, user);
        else {
          db.users
            .insert({
              id,
              displayname
            })
            .then((newUser) => {
              if (newUser) cb(null, newUser);
              else {
                cb(new Error('Something wrong with inserting with fbLogin function'));
              }
            });
        }
      });
  }
};
