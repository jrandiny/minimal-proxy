module.exports = {
  httpPostBody: (data) => {
    const data_in_text = data.toString('ascii');
    if (data_in_text.includes('<body>')) {
      data = `<p style="text-align:center;top: 0px;left: 0px;width: 100vw;background-color: rgba(1,1,1,0.03);padding: 10px;">The gatekeeper is watching</p>${data}`
    }
    return data;
  }
}