# Simple Proxy

## Running
```bash
npm start
```

## Configuration

Edit `config.json`

```js
{
  // File location
  "user_db": "configs/user.json", 
  "page_template": "configs/template.js",
  "ssl_key": "configs/key.pem", // only for https
  "ssl_cert": "configs/cert.pem", // only for https
  // Behaviour
  "protocol": "https_bypass",
  "port": 8080,
  "use_auth": true
}

```

### Protocol

This proxy server support 3 protocol mode
```
http - Http only proxy server

https - Full https proxy server, need proper certificate configuration

https_bypass - Hybrid proxy server, bypass modification for https (can't modify header or body)
```

### Plugin

This proxy server support plugins

In order to be used, plugins must be located at `plugins` folder and contains an `index.js` file

Required exported parameter
```js
module.exports = {
  httpPre: (req,res)=>{
    // Function executed on http request
    return [req,res]; // Pass request to the next chain
    return false; // Stop request
  },
  tcpPre: (req,socket,headbody)=>{
    // Function executed on tcp request (https_bypass mode)
    return [req, socket, headbody] // Pass request to the next chain
    return false; // Stop request
  },
  httpPostHeader: (status, header)=>{
    // Function executed on http request, 
    return [status, header, end_process] // Set end_chain to true to stop request (e.g. redirection)
  },
  httpPostTransform: (chunk)=>{
    // Function executed on EVERY http request body, including non html content (e.g. images)
    return chunk;
  }
  contentGenerator: (contentGenerator)=>{
    // Called by plugin subsystem on load
    // Give plugin access to contentGenerator
    // Plugin may save contentGenerator for future access
    // Optional
  }
}
```

#### Content Generator

A helper function to generate html page

Default generator field

```js
contentGenerator({
  title: 'page title (on tab bar)',
  heading: 'Heading on page (e.g. Page blocked)',
  content: 'Page content (e.g. You are not allowed to access this page)'
})
```