const fs = require('fs');

const conf = JSON.parse(fs.readFileSync('config.json'));
const user_store = new (require('./userStore'))(conf.user_db);

function cookieParser(cookie_string) {
  if (cookie_string) {
    const cookie_arr = cookie_string.split('; ');
    const cookie_obj = {};

    cookie_arr.forEach(cookie => {
      const keypair = cookie.split('=');
      cookie_obj[keypair[0]] = keypair[1];
    });

    return cookie_obj;
  } else {
    return {};
  }
}

function checkAuth(proxy_authorization) {
  let verified = !conf.use_auth;

  if (!conf.use_auth || proxy_authorization) {
    if (!verified) {
      const auth_data = Buffer.from(proxy_authorization.split(' ')[1], 'base64').toString();
      const user_data = auth_data.split(':');
      verified = user_store.verify(user_data[0], user_data[1]);
    }
  }

  return verified;
}

module.exports = { checkAuth, cookieParser }