module.exports = {
  httpPostHeader: (status, header) => {
    if (header['set-cookie']) {
      delete header['set-cookie'];
    }
    return [status, header, false];
  }
}