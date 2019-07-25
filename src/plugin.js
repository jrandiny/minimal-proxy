const fs = require('fs');
const path = require('path');
const conf = JSON.parse(fs.readFileSync('config.json'));
const contentGenerator = require(path.resolve(conf.page_template));

const plugin_location = 'plugins';

const http_pre_chain = [];
const http_post_chain = [];
const tcp_pre_chain = [];

function load() {
  const plugin_list = fs.readdirSync(plugin_location);
  console.log(`${plugin_list.length} plugins detected`);
  plugin_list.forEach((directory) => {
    console.log(`Loading ${directory}`);
    const temp_conf = require(path.resolve(plugin_location, directory, 'index'));

    if (temp_conf.http_pre) {
      http_pre_chain.push(temp_conf.http_pre);
    }

    if (temp_conf.tcp_pre) {
      tcp_pre_chain.push(temp_conf.tcp_pre);
    }

    if (temp_conf.http_post) {
      http_post_chain.push(temp_conf.http_post);
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

function processHttpPost(req, res) {

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

module.exports = { load, processHttpPre, processTcpPre, contentGenerator };