const net = require('net');
const { checkAuth, blocklistTest } = require('./common');

async function handler(user_req, user_socket, _user_bodyhead) {
  const [hostname, port] = user_req.url.split(':');
  const proxy_authorization = user_req.headers["proxy-authorization"];

  console.log(hostname, port);
  console.log(proxy_authorization);

  if (checkAuth(proxy_authorization)) {
    if (blocklistTest(hostname)) {
      user_socket.write([
        'HTTP/1.1 303 See Other',
        'Location: http://blocked.localhost', ''
      ].join('\r\n'));
      user_socket.end();
    } else {
      const proxy_socket = net.connect(port, hostname, () => {
        user_socket.write([
          'HTTP/1.1 200 Connection Established', '', ''
        ].join('\r\n'));
        proxy_socket.pipe(
          user_socket, { end: true }
        );
        proxy_socket.on('error', () => {
          if (user_socket) {
            user_socket.end();
          }
        });
      });
      user_socket.pipe(proxy_socket, { end: true });
      user_socket.on('error', () => {
        if (proxy_socket) {
          proxy_socket.end();
        }
      });
    }
  }
}

module.exports = handler;