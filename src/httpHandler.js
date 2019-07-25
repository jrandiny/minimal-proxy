const http = require('http');
const fs = require('fs');
const path = require('path');

const conf = JSON.parse(fs.readFileSync('config.json'));
const contentGenerator = require(path.resolve(conf.page_template));
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

      proxy_req.on('error', (error) => {
        console.error('http-proxy', error);
        if (user_res) {
          if (error.errno === 'ENOTFOUND') {
            const page = contentGenerator({
              title: 'Not found',
              heading: 'Lost',
              content: 'It seems the page you are looking for doesn\'t exists'
            });
            user_res.writeHead(404, { 'Content-Type': 'text/html' });
            user_res.write(page);
            user_res.end();
          }
          user_res.end();
        }
      });

      user_req.on('error', (error) => {
        console.error('http-user', error);
        if (proxy_req) {
          proxy_req.end();
        }
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