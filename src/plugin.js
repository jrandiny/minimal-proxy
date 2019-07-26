const fs = require('fs');
const path = require('path');
const conf = JSON.parse(fs.readFileSync('config.json'));
const contentGenerator = require(path.resolve(conf.page_template));

const { Transform } = require('stream');

const plugin_location = 'plugins';

const http_pre_chain = [];
const http_post_body_chain = [];
const http_post_header_chain = [];
const tcp_pre_chain = [];

function load() {
  const plugin_list = fs.readdirSync(plugin_location);
  console.log(`${plugin_list.length} plugins detected`);
  plugin_list.forEach((directory) => {
    console.log(`Loading ${directory}`);
    const temp_conf = require(path.resolve(plugin_location, directory, 'index'));

    if (temp_conf.httpPre) {
      http_pre_chain.push(temp_conf.httpPre);
    }

    if (temp_conf.tcpPre) {
      tcp_pre_chain.push(temp_conf.tcpPre);
    }

    if (temp_conf.httpPostBody) {
      http_post_body_chain.push(temp_conf.httpPostBody);
    }

    if (temp_conf.httpPostHeader) {
      http_post_header_chain.push(temp_conf.httpPostHeader);
    }

    if (temp_conf.contentGenerator) {
      temp_conf.contentGenerator(contentGenerator);
    }
  });
}

function processHttpPre(req, res) {
  if (http_pre_chain.every((handler) => {
    const temp_return = handler(req, res);
    if (temp_return) {
      [req, res] = temp_return;
      return true;
    } else {
      return false;
    }
  })) {
    return [req, res];
  } else {
    return false;
  }
}

class processHttpPostBody extends Transform {
  constructor(user_res) {
    super()
    this.user_res = user_res;
  }

  _transform(chunk, enc, done) {
    http_post_body_chain.forEach((transformer) => {
      chunk = transformer(chunk);
    });

    this.push(chunk);
    done();
  }
}

function processHttpPostHeader(status, header) {
  let end_process;
  http_post_header_chain.every((handler) => {
    const temp_return = handler(status, header);
    [status, header, end_process] = temp_return;
    return !end_process;
  });
  return [status, header, end_process];

}

function processTcpPre(req, socket, headbody) {
  if (tcp_pre_chain.every((handler) => {
    const temp_return = handler(req, socket, headbody);
    if (temp_return) {
      [req, socket, headbody] = temp_return;
      return true;
    } else {
      return false;
    }
  })) {
    return [req, socket, headbody];
  } else {
    return false;
  }
}

module.exports = { load, processHttpPre, processTcpPre, processHttpPostBody, processHttpPostHeader, contentGenerator };