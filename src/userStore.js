const fs = require('fs');
const crypto = require('crypto');

class userStore {
  constructor(file_location) {
    this.file_location = file_location;
    if (fs.existsSync(file_location)) {
      this.db = JSON.parse(fs.readFileSync(file_location));
    } else {
      console.warn('File doesn\'t exists, creating new file');
      this.db = {};
    }
  }

  verify(username, password) {
    const user_object = this.db[username];
    if (user_object) {
      const salt = user_object.salt;
      const hashed_input = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
      return hashed_input === user_object.hash;
    } else {
      return false;
    }
  }

  create(username, password) {
    const salt = crypto.randomBytes(64).toString('base64')
    this.db[username] = {
      salt: salt,
      hash: crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex')
    };

    fs.writeFileSync(this.file_location, JSON.stringify(this.db, null, 4));
  }

  delete(username) {
    if (this.db[username]) {
      delete this.db[username];
      fs.writeFileSync(this.file_location, JSON.stringify(this.db, null, 4));
    }
  }
}

module.exports = userStore;