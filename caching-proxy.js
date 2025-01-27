import express from "express";
import http from "http"
import url from "url"

const app = express() //main server
const cache = new Map() //cache proxy server

const port = 3000
const origin = "https://dummyjson.com"

//handling requests
app.get("*",(req, res)=>{
    const targetUrl = new URL(req.url,origin)
    //cache logic
    if (cache.has(targetUrl)) {
        console.log("Cache Hit!")
        const cacheResponse = cache.get(targetUrl)
        res. set(cacheResponse.headers)
        res.set("X-cache","Hit")
        res.status(200).send(cacheResponse.body)
    }else{
        console.log('Cache miss!');
        const options = {
          hostname: targetUrl.hostname, 
          port: targetUrl.port, 
          path: targetUrl.pathname + targetUrl.search, 
          method: req.method, 
          headers: req.headers
        };
      
        http.get(options, (proxyRes) => { 
          let body = ''; 
          proxyRes.on('data', (chunk) => (body += chunk)); 
          proxyRes.on('end', () => { 
            res.set(proxyRes.headers);
            res.set('X-Cache', 'MISS'); 
            res.status(proxyRes.statusCode).send(body); 
            cache.set(targetUrl, { body, headers: proxyRes.headers }); 
          });
        });
      
    }
})

app.get('/clear-cache', (req, res) => {
    cache.clear();
    res.send('Cache cleared!');
  });

  app.listen(port, () => {
    console.log(`Caching proxy server listening on port ${port}`);
    console.log(`Forwarding requests to ${origin}`);
  });
  