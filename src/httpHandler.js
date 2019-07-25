const http = require('http');
const fs = require('fs');

const conf = JSON.parse(fs.readFileSync('config.json'));
const { checkAuth, cookieParser } = require('./common');
const { processHttpPre } = require('./plugin');

async function handler(user_req, user_res) {
  const user_url = user_req.url;
  const cookies = cookieParser(user_req.headers.cookie);
  const proxy_authorization = user_req.headers["proxy-authorization"];

  console.log(user_url);
  console.log(cookies);

  if (checkAuth(proxy_authorization)) {
    const temp_return = processHttpPre(user_req, user_res);
    if (temp_return) {
      [user_req, user_res] = temp_return;
      let proxy_req = http.request(user_url, (proxy_res) => {
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
    user_res.writeHead(407, {
      'Proxy-Authenticate': 'Basic realm=proxy'
    });
    user_res.end();
  }
}

module.exports = handler;