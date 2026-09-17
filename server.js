import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('./public/',import.meta.url));
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png'};
const server=http.createServer(async(req,res)=>{if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);return res.end();}let route;try{route=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);return res.end();}if(route==='/health'){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});return res.end(JSON.stringify({ok:true,version:'4.0.1'}));}const file=path.resolve(root,'.'+(route==='/'?'/index.html':route));if(!file.startsWith(root)){res.writeHead(403);return res.end();}try{if(!(await stat(file)).isFile())throw Error();const data=await readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:data);}catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Não encontrado');}});
server.listen(Number(process.env.PORT)||3000,'0.0.0.0',()=>console.log('Marvel Pixel Defense listening'));
