import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {basePath,outputDir} from '../src/site-config.mjs';
const base=outputDir;
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.json':'application/json','.xml':'application/xml','.txt':'text/plain; charset=utf-8'};
const port=Number(process.env.PORT??4173);
http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');
  if(basePath&&url.pathname!==basePath&&!url.pathname.startsWith(basePath+'/')){res.writeHead(404);return res.end('Not found');}
  const rel=decodeURIComponent(url.pathname.slice(basePath.length));let file=path.resolve(base,'.'+rel);
  if(file!==base&&!file.startsWith(base+path.sep)){res.writeHead(403);return res.end();}
  let stat;try{stat=await fs.stat(file);}catch{file=path.join(base,'404.html');res.statusCode=404;}
  if(stat?.isDirectory()){
    if(!url.pathname.endsWith('/')){res.writeHead(301,{Location:url.pathname+'/'+url.search});return res.end();}
    file=path.join(file,'index.html');
  }
  res.setHeader('Content-Type',types[path.extname(file)]??'application/octet-stream');res.setHeader('Cache-Control','no-cache');
  const data=await fs.readFile(file);res.end(data);
 }catch(e){res.writeHead(500);res.end('Preview error');}
}).listen(port,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:'+port+basePath+'/ru/'));
