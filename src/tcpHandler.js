const net = require('net');
const { checkAuth } = require('./common');
const { processTcpPre } = require('./plugin');

async function handler(user_req, user_socket, user_bodyhead) {
  const [hostname, port] = user_req.url.split(':');
  const proxy_authorization = user_req.headers["proxy-authorization"];

  console.log(hostname, port);
  console.log(proxy_authorization);

  if (checkAuth(proxy_authorization)) {
    const temp_return = processTcpPre(user_req, user_socket, user_bodyhead);
    if (temp_return) {
      [user_req, user_socket, user_bodyhead] = temp_return;
      const proxy_socket = net.connect(port, hostname, () => {
        user_socket.write([
          'HTTP/1.1 200 Connection Established', '', ''
        ].join('\r\n'));
        proxy_socket.pipe(
          user_socket, { end: true }
        );
      });

      proxy_socket.on('error', (error) => {
        console.error('tcp-proxy', error);
        if (user_socket) {
          user_socket.end();
        }
      });

      user_socket.on('error', (error) => {
        console.error('tcp-user', error)
        if (proxy_socket) {
          proxy_socket.end();
        }
      });
      user_socket.pipe(proxy_socket, { end: true });
    }
  } else {
    user_socket.write([
      'HTTP/1.1 407 Proxy Authentication Required',
      'Proxy-Authenticate: Basic realm=proxy', '', ''
    ].join('\r\n'));
    user_socket.end();
  }
}

module.exports = handler;