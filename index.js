const http = require('http');
const https = require('https');
const fs = require('fs');
const port = 3000;

const conf = JSON.parse(fs.readFileSync('config.json'));
const tcpHandler = require('./src/tcpHandler');
const httpHandler = require('./src/httpHandler');
const plugin = require('./src/plugin');

plugin.load();

const https_conf = {
  key: conf.ssl_key ? fs.readFileSync(conf.ssl_key) : "",
  cert: conf.ssl_cert ? fs.readFileSync(conf.ssl_cert) : ""
};

let server;

switch (conf.protocol) {
  case 'https_bypass':
  case 'http':
    server = http.createServer(httpHandler);
    break;
  case 'https':
    if (https_conf.cert && https_conf.key) {
      server = https.createServer(https_conf, httpHandler);
    } else {
      console.error(`Invalid cert and key for https`);
    }
    break;
  default:
    console.error(`Invalid protocol config, avaiable options ['http','https','https_bypass']`);
    break;
}

if (server) {
  server.listen(port, (err) => {
    if (err) {
      return console.error(err);
    }
    console.log(`server is listening on ${port}`);
  });

  if (conf.protocol === 'https_bypass') {
    server.on('connect', tcpHandler);
  }
}