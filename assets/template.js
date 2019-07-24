module.exports = (data) => `
<html>
<head>
<title>${data.title}</title>
<style>
  body {
    text-align: center;
    padding: 150px;
  }

  h1 {
    font-size: 50px;
  }

  body {
    font: 20px Helvetica, sans-serif;
    color: #333;
  }

  article {
    display: block;
    text-align: left;
    width: 650px;
    margin: 0 auto;
  }

  a {
    color: #dc8100;
    text-decoration: none;
  }

  a:hover {
    color: #333;
    text-decoration: none;
  }

  .outLinkSection {
    flex-direction: row;
    display: flex;
    align-items: center
  }

  .outLink {
    width: 150px
  }
</style>
</head>

<body>
<article>
  <h1>${data.heading}</h1>
  <div>
    <p>${data.content}</p>
    <p>&mdash; The gatekeeper</p>
  </div>
</article>
</body>
</html>`