const sqlite3 = require('sqlite3').verbose();

const isEmailUnique = (db, email) => {
    const query = 'SELECT COUNT(*) as count FROM users WHERE email = ?';
    return new Promise(res=>{
      db.get(query, [email], (err, row) => {
          if (err) {
              res(false);
              return;
          }
          const isUnique = row.count === 0;
          res(isUnique);
      });
    });
};

const isUsernameUnique = (db, username) => {
    const query = 'SELECT COUNT(*) as count FROM users WHERE username = ?';
    return new Promise(res=>{
      db.get(query, [username], (err, row) => {
          if (err) {
              res(false);
              return;
          }
          const isUnique = row.count === 0;
          res(isUnique);
      });
    })
};

const checkUnique = (db, email, username) => {
  return new Promise(async res=>{
    const isEmailValid = await isEmailUnique(db, email);
    if (!isEmailValid) {
      return res({ isUnique: false, field: "email" });
    }

    const isUsernameValid = await isUsernameUnique(db, username);
    if (!isUsernameValid) {
      res({ isUnique: false, field: "username" });
    }
  
    if (isEmailValid && isUsernameValid) {
      res({ isUnique: true, field: 'Email and username are both unique.' });
    }
  });

};

const addToDb = (db, user)=>{
  return new Promise(res=>{
    db.run(
      'INSERT INTO users (username, email, password, name, date_of_birth) VALUES (?, ?, ?, ?, ?)',
      [
        user.username,
        user.email,
        user.password,
        user.name,
        user.dob
      ],
      function (err) {
        if (err) {
          throw err.message;
        }
        res({ id: this.lastID });
      }
    );
  });
};

const add_to_verify_table = (db, email, id, unq_id)=>{
  return new Promise(res=>{
    db.run(
      'INSERT INTO verfiy_user (unq_id, email, user_id, isDone) VALUES (?, ?, ?, ?)',
      [unq_id, email, id, 0],
      function (err) {
        if (err) {
          throw new Error(err.message);
        }
        res(this.lastID);
      }
    );
  });
  
}

const update_verify_table = (db, id)=>{
  return new Promise(res=>{
    db.all('SELECT *  FROM verfiy_user WHERE unq_id = ?', [id], function(err, rows){
      if(err) throw new Error(err);

      if(rows.length <= 0) return res({ error: 404 });

      let londonDate = new Date(rows[0].created_at + ' UTC');
      let dateString = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kolkata',
        timeStyle: 'long',
        dateStyle: 'full',
      }).format(londonDate);

      // Extract the relevant information from the date string
      const [, month, day, year, time, ampm, offset] = dateString.match(
        /(\w+), (\w+) (\d+), (\d+) at (\d+:\d+:\d+ [APMapm]{2}) GMT([\+\-]\d+:\d+)/
      );

      // Construct the modified date string in a format that can be parsed by Date
      const modifiedDateString = `${month} ${day}, ${year} ${time} ${ampm} ${offset}`;

      // Parse the modified date string into a Date object
      const jsDate = new Date(modifiedDateString);
      let diff = (new Date() - jsDate) / (60*1000);

      if(diff < 15 && rows[0].isDone == 0){
        db.run(
          'UPDATE verfiy_user SET isDone = ? WHERE unq_id = ?',
          [1, id],
          function (err) {
            if (err) {
              throw new Error(err.message);
            }
            
            res({ message: 200, data: "Success"  });
            db.run(
              'UPDATE users SET verified = ? WHERE user_id = ?',
              [ 1, rows[0].user_id ],
              function(err){
                if (err) {
                  throw new Error(err.message);
                }
                res({ data: 200 });
              }
            )
          }
        );
      }else{
        console.log("here")
        res({ error: 404 })
      }
    })
  })
}

const checkUsrEmail = (db, e_u)=>{
  return new Promise(res=>{
    db.get('SELECT user_id, username, email, password, verified, name FROM users WHERE email = ? OR username = ?', [e_u, e_u], (err, row) => {
      if (err) {
          throw new Error(err.message);
      }
  
      if (row) {
        res({ data: [row.password, row.user_id, row.username, row.email, row.name, row.verified] });
      } else {
        res({ error: 404 });
      }
    });
  });
}

const check_token = (db, tkn, user_id)=>{
  return new Promise(res=>{
    db.get('SELECT token FROM users WHERE user_id = ?', [user_id], (err, row) => {
      if (err) {
          throw new Error(err.message);
      }

      if (row) {
        if(row.token == tkn){
          res({ data: true });
        }else{
          res({ error: 404 });
        }
      } else {
        res({ error: 404 });
      }

    });
  });
}

const set_user_token = (db, tkn, id)=>{
  // return new Promise(()=>{
    db.run(
      'UPDATE users SET token = ? WHERE user_id = ?',
      [tkn, id],
      function(err){
        if(err) throw new Error(err);
      }
    );
  // });
}

function runCmd(func){
  // Open a SQLite database file. If it doesn't exist, it will be created.
  const db = new sqlite3.Database('data.db');
  return func(db);
  db.close();
  // Close the database connection
};


module.exports = {
  checkUnique: (e, u) => runCmd((db)=>checkUnique(db, e, u)),
  addToDb: (u) => runCmd(db=>addToDb(db, u)),
  add_to_verify_table: (i, e, u) => runCmd(db=>add_to_verify_table(db, i, e, u)),
  update_verify_table: (i) => runCmd(db=>update_verify_table(db, i)),
  checkUsrEmail: (e) => runCmd(db=>checkUsrEmail(db, e)),
  set_user_token: (e, i) => runCmd(db=>set_user_token(db, e, i)),
  check_token: (e, i) => runCmd(db=>check_token(db, e, i))
}

