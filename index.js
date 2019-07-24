const http = require('http');
const fs = require('fs');
const port = 3000;

const conf = JSON.parse(fs.readFileSync('config.json'));
const user_store = new (require('./userStore'))(conf.user_db);
const content_generator = require(`./${conf.assets_loc}/template.js`)

const blocklist_regex = conf.blocklist.map((val) => {
  return new RegExp(val);
});
const blocklistTest = (url) => {
  return blocklist_regex.some((val) => {
    return val.test(url);
  });
};

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

function routeRequestAuth(user_res) {
  user_res.writeHead(407, {
    'Proxy-Authenticate': 'Basic realm=proxy'
  });
  user_res.end();
}

function routeBlocked(user_res) {
  const page = content_generator({
    title: 'Blocked',
    heading: 'Nope',
    content: 'You are not allowed to access this URL'
  });
  user_res.writeHead(403, { 'Content-Type': 'text/html' });
  user_res.write(page);
  user_res.end();
}

const server = http.createServer(async (user_req, user_res) => {
  const url = user_req.url;
  const cookies = cookieParser(user_req.headers.cookie);
  const proxy_authorization = user_req.headers["proxy-authorization"];

  console.log(url);
  console.log(cookies);

  if (!conf.use_auth || proxy_authorization) {
    let verified = !conf.use_auth;
    if (!verified) {
      const auth_data = Buffer.from(proxy_authorization.split(' ')[1], 'base64').toString();
      const user_data = auth_data.split(':');
      verified = user_store.verify(user_data[0], user_data[1]);
    }

    if (verified) {
      if (blocklistTest(url)) {
        routeBlocked(user_res);
      } else {
        let proxy_req = http.request(url, (proxy_res) => {
          user_res.writeHead(proxy_res.statusCode, proxy_res.headers);

          proxy_res.pipe(user_res, {
            end: true
          });
        });

        user_req.pipe(proxy_req, {
          end: true
        });
      }
    } else {
      routeRequestAuth(user_res);
    }
  } else {
    routeRequestAuth(user_res);
  }
});

server.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err);
  }

  console.log(`server is listening on ${port}`);
});