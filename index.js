const http = require('http');
const fs = require('fs');
const port = 3000;

const blocklistFile = JSON.parse(fs.readFileSync('blocklist.json'));
const blocklistRegex = blocklistFile.map((val) => {
  return new RegExp(val);
})
const blocklistTest = (url) => {
  return blocklistRegex.some((val) => {
    return val.test(url);
  });
}

const server = http.createServer(async (user_req, user_res) => {
  console.log(user_req.url);
  const url = user_req.url;

  if (blocklistTest(url)) {
    user_res.writeHead(403);
    user_res.write('403 Forbidden - URL blocked');
    user_res.end();
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

});

server.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err);
  }

  console.log(`server is listening on ${port}`);
});