# Simple Proxy

## Running
```bash
npm start
```

## Configuration

Edit `config.json`

```json
{
  // File location
  "user_db": "configs/user.json", 
  "page_template": "configs/template.js",
  "ssl_key": "configs/key.pem", // only for https
  "ssl_cert": "configs/cert.pem", // only for https
  // 
  "protocol": "https_bypass",
  "use_auth": true,
  "blocklist": [
    "blocked.localhost", // Required for https_bypass
    "google.com"
  ]
}

```

### Protocol

This proxy server support 3 protocol mode
```
http - Http only proxy server

https - Full https proxy server, need proper certificate configuration

https_bypass - Hybrid proxy server, bypass modification for https (can't modify header or body)
```

