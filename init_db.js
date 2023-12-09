const PermissionSet = require('./board');

const sqlite3 = require('sqlite3').verbose();

// Open a SQLite database file. If it doesn't exist, it will be created.\
console.log("Creating the Database...");
const db = new sqlite3.Database('data.db');

try{

  console.log("Creating UserRolePermission TABLE...");
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS UserRolePermission (
        role VARCHAR(255) NOT NULL,
        permission TEXT NOT NULL
      )
    `);

    console.log('UserRolePermission table created successfully.');
  });

  console.log("creating user role table....");

  const role = 'user';
  const permission = new PermissionSet();
  permission.addDatabase("users");
  permission.setPermission({ c: 0, r: 1, u: 1, d: 0 });
  permission.setRole("user");

  const insertQuery = `
    INSERT INTO UserRolePermission (role, permission)
    VALUES (?, ?)
  `;

  db.run(insertQuery, [role, permission.getString()], function (err) {
    if (err) {
      console.error(err.message);
    } else {
      console.log(`Row inserted with ID: ${this.lastID}`);
    }
  });

  // Creating users TABLE
  console.log("Creating User TABLE...");
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(50),
        date_of_birth DATE,
        token VARCHAR(255),
        verified BOOLEAN DEFAULT 0,
        role VARCHAR(255) REFERENCES UserRolePermission(role) DEFAULT 'user' NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  
    console.log('users TABLE created successfully.');
  });
  
  console.log("Creating verify_user TABLE...");
  
  db.serialize(() => {
    db.run(`
    CREATE TABLE IF NOT EXISTS verfiy_user (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      unq_id VARCHAR(25) NOT NULL,
      email VARCHAR(255) NOT NULL,
      user_id INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      isDone BOOLEAN DEFAULT 0
      )
      `);
      
      console.log('verity_user table created successfully.');
    });

}catch(err){ console.log(err); }
finally{
  // Close the database connection
  console.log("Setup Completed!!");
  console.log("Closing the Database..");
  db.close();
}