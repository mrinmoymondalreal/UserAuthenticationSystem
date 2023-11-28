const sqlite3 = require('sqlite3').verbose();

// Open a SQLite database file. If it doesn't exist, it will be created.\
console.log("Creating the Database...");
const db = new sqlite3.Database('data.db');

try{

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


