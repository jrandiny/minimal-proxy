const fs = require('fs');
const path = require('path');

let contentGenerator;

const blocklist = JSON.parse(fs.readFileSync(path.join(__dirname, 'blocklist.json')));

const blocklist_regex = blocklist.map((val) => {
  return new RegExp(val);
});
const blocklistTest = (url) => {
  return blocklist_regex.some((val) => {
    return val.test(url);
  });
};

const conf = {
  contentGenerator: (cg) => { contentGenerator = cg },
  http_pre: (user_req, user_res) => {
    const user_url = user_req.url;
    if (blocklistTest(user_url)) {
      const page = contentGenerator({
        title: 'Blocked',
        heading: 'Nope',
        content: 'You are not allowed to access this URL'
      });
      user_res.writeHead(403, { 'Content-Type': 'text/html' });
      user_res.write(page);
      user_res.end();
      return false;
    } else {
      return [user_req, user_res];
    }
  },
  http_post: false,
  tcp_pre: (user_req, user_socket, user_bodyhead) => {
    const [hostname] = user_req.url.split(':');
    if (blocklistTest(hostname)) {
      user_socket.write([
        'HTTP/1.1 303 See Other',
        'Location: http://blocked.localhost', ''
      ].join('\r\n'));
      user_socket.end();
      return false;
    } else {
      return [user_req, user_socket, user_bodyhead];
    }
  },
}

module.exports = conf