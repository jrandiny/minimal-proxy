const http = require('http');
const port = 3000;


const server = http.createServer(async (user_req, user_res) => {
  console.log(user_req.url);
  console.log(user_req.headers);
  let proxy_req = http.request(user_req.url, (proxy_res) => {
    user_res.writeHead(proxy_res.statusCode, proxy_res.headers);

    proxy_res.pipe(user_res, {
      end: true
    });
  });

  user_req.pipe(proxy_req, {
    end: true
  });
});

server.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err);
  }

  console.log(`server is listening on ${port}`);
});