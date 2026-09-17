import {HEROES,BIOMES,random} from './engine.js?v=4.0.1';
const terrainImage=new Image(),powerImage=new Image();
const loadImage=(image,src)=>new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=reject;image.src=src;});
export const artReady=Promise.all([loadImage(terrainImage,'/assets/terrain-v3.png'),loadImage(powerImage,'/assets/power-effects-v4.png')]);
const PALETTES={spider:['#e94050','#961f3a','#3881c1','#153e72','#f9f1de'],iron:['#c93742','#74273a','#f9c15c','#b97738','#97f4ff'],hulk:['#89c15b','#4b8041','#79649e','#443760','#c6ed8d'],thor:['#607b91','#344154','#c4474c','#882f41','#e6cd86'],torch:['#ffab44','#e55534','#ffdc77','#a62d35','#fff3b6'],hawkeye:['#9569b9','#503566','#303d58','#1a263b','#e3bb95'],cap:['#487fb8','#254e82','#e2d6b0','#b63b4d','#f5edcf'],strange:['#367d98','#20516d','#ce514f','#752c46','#efd1a3'],cyclops:['#456da8','#264778','#f3bd54','#b47734','#f6d2a5'],drone:['#798b94','#485d71','#465869','#27374d','#de799e'],runner:['#ad6396','#65345f','#533f69','#322c46','#faaa65'],brute:['#8e9c7d','#536458','#525775','#303a52','#ffcb68'],boss:['#aa82bd','#685180','#d5ad61','#8b6741','#ffc8ed']};
// Native pixel sprites assembled from shaded parts. All poses are rasterized to an atlas.
function pixelSprite(c,id,frame,state){const p=PALETTES[id]||PALETTES.drone,[a,b,d,e,light]=p;const R=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};const box=(x,y,w,h,col,shade)=>{R(x-1,y-1,w+2,h+2,'#162337');R(x,y,w,h,col);R(x,y+h-2,w,2,shade);};const walk=state==='walk'?([0,2,3,0,-2,-3][frame%6]):0,attack=state==='attack'||state==='cast'?([0,1,3,5,3,1][frame%6]):0,bob=state==='idle'?([0,0,-1,-1,0,0][frame%6]):0;
 c.save();c.translate(0,bob);const broad=id==='hulk'||id==='brute'||id==='boss';
 if(id==='thor'||id==='strange'){R(8,14,16,20,e);R(6,23,20,12,d);R(9,17,3,16,a);R(23,25,2,8,b);}
 if(id==='torch'){for(let i=0;i<6;i++){const x=7+i*3,fl=(i+frame)%3;R(x,10-fl*3,3,14,'#ee6737');R(x+1,11-fl*2,2,10,'#ffcf5a');}R(6,29,3,8,'#ff8734');R(24,27,3,9,'#ffb845');}
 box(10,27-walk,5,10+walk,d,e);box(18,27+walk,5,10-walk,d,e);R(8,35-walk,7,3,id==='spider'||id==='cap'?a:b);R(18,35+walk,8,3,id==='spider'||id==='cap'?a:b);R(11,29,2,5,a);R(19,29,2,5,a);
 box(broad?7:10,14,broad?19:13,15,a,b);R(12,16,3,7,light);R(11,24,11,3,d);R(15,25,3,2,light);R(19,17,3,6,a);
 box(broad?3:5,16,broad?6:4,10+walk,a,b);R(4,25+walk,5,4,id==='hulk'?a:d);
 box(24,16-attack,4+attack,10-attack,a,b);R(25+attack,23-attack,4,4,id==='hulk'?a:d);
 box(11,3,12,12,a,b);R(13,2,8,2,a);R(12,4,3,5,light);R(12,11,10,2,b);
 if(id==='spider'){R(12,5,3,3,b);R(19,5,3,3,b);R(12,6,3,2,'#fff5e1');R(19,6,3,2,'#fff5e1');R(16,3,1,10,b);R(11,9,12,1,b);R(16,17,2,6,'#172e49');R(13,18,8,1,'#172e49');R(14,21,6,1,'#172e49');R(10,22,3,5,d);R(21,22,2,5,d);}
 else if(id==='iron'){R(13,4,8,8,d);R(11,5,2,5,d);R(21,5,2,5,d);R(12,7,3,1,light);R(19,7,3,1,light);R(15,11,4,1,b);R(15,18,5,4,'#c9fbff');R(16,19,3,2,'#64d6ed');R(10,29,5,3,d);R(18,29,5,3,d);R(5,19,4,3,d);R(24,17,4,3,d);if(frame%2){R(10,38,4,2,light);R(19,38,4,2,light);}}
 else if(id==='hulk'){R(10,2,13,4,'#273937');R(11,5,2,2,'#273937');R(13,8,2,1,'#172f30');R(19,8,2,1,'#172f30');R(15,12,5,1,light);R(13,17,8,6,a);R(16,16,1,9,b);R(10,21,14,1,b);R(9,26,16,5,d);}
 else if(id==='thor'){R(11,4,12,4,'#bbcbd0');R(8,5,4,2,'#f0e9c9');R(22,5,4,2,'#f0e9c9');R(13,8,8,5,light);R(12,11,10,3,'#c19856');R(11,17,3,3,'#d9e4de');R(19,17,3,3,'#d9e4de');R(11,22,3,2,'#d9e4de');R(19,22,3,2,'#d9e4de');R(28,19-attack,2,11,'#a98357');box(26,15-attack,6,5,'#b7d0d3','#688697');}
 else if(id==='cap'){R(15,4,4,4,'#e9e9d4');R(16,5,2,2,a);R(13,10,8,4,light);R(15,17,5,2,'#fff2d7');R(16,16,2,5,'#fff2d7');R(11,23,11,4,light);R(12,23,2,4,'#b8404d');R(17,23,2,4,'#b8404d');box(23,22-attack,9,11,'#c44b51','#7f3049');R(24,24-attack,7,7,'#ede3c6');R(25,25-attack,5,5,a);R(27,26-attack,1,3,'#fff5df');R(26,27-attack,3,1,'#fff5df');}
 else if(id==='hawkeye'){R(11,3,12,4,'#9a7150');R(12,7,10,6,light);R(11,7,12,3,b);R(12,8,3,1,'#fff1e1');R(20,8,2,1,'#fff1e1');R(12,17,8,8,d);R(15,17,2,8,a);R(29,13-attack,1,19,'#cea275');R(30,15-attack,1,15,'#cea275');R(27,13-attack,2,1,'#cea275');R(27,31-attack,2,1,'#cea275');R(27,14-attack,1,17,'#ecdeb9');}
 else if(id==='strange'){R(11,3,12,4,'#302d37');R(12,7,10,6,light);R(10,5,2,4,'#e0ddd2');R(22,5,2,4,'#e0ddd2');R(13,9,2,1,'#393747');R(19,9,2,1,'#393747');R(15,12,5,2,'#4c3433');R(7,13,5,5,d);R(22,13,5,5,d);R(16,17,3,3,'#f6c966');R(11,24,12,2,'#e5ae55');R(26,19-attack,5,2,'#69e0ae');R(27,17-attack,2,6,'#aff6a9');}
 else if(id==='cyclops'){R(12,3,11,3,'#785540');R(11,7,13,3,d);R(12,8,11,1,'#ff4557');R(14,11,8,3,light);R(11,16,2,10,d);R(20,16,2,10,d);R(11,25,12,3,d);R(16,25,3,3,'#f46550');}
 else if(id==='torch'){R(13,7,3,2,'#fff1a2');R(20,7,2,2,'#fff1a2');R(16,17,3,7,'#ffec96');R(10,1-frame%3,3,5,'#ffba43');R(20,-frame%2,3,5,'#ffd26c');}
 else{R(11,3,12,4,b);R(12,7,10,3,'#263347');R(13,8,3,1,light);R(19,8,3,1,light);R(15,18,5,4,light);R(16,19,3,2,b);if(id==='boss'){R(10,2,14,2,d);R(9,1,3,4,d);R(22,1,3,4,d);R(8,15,17,3,d);}}
 if(state==='cast'){R(2+frame,8,2,2,light);R(29-frame,5+frame,2,3,light);R(1,30-frame,2,2,light);}
 c.restore();}
const cache=new Map();
export function sprite(ctx,id,x,y,scale=1,time=0,state='idle',dir=1,progress=0){
 const frame=state==='attack'||state==='cast'?Math.min(5,Math.floor(progress*6)):Math.floor(time*(state==='walk'?10:5))%6,key=id+'-'+state;let atlas=cache.get(key);
 if(!atlas){atlas=document.createElement('canvas');atlas.width=216;atlas.height=44;const c=atlas.getContext('2d');for(let f=0;f<6;f++){c.save();c.translate(f*36+1,2);pixelSprite(c,id,f,state);c.restore();}cache.set(key,atlas);}
 ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.scale(dir*scale,scale);ctx.imageSmoothingEnabled=false;ctx.drawImage(atlas,frame*36,0,36,44,-18,-37,36,44);ctx.restore();
}
export function drawPortrait(canvas,id,time=0){const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);c.imageSmoothingEnabled=false;sprite(c,id,canvas.width/2,canvas.height-8,canvas.height/48,time);}
const tileCache=new Map();
function textureTile(row,col){const key=row+','+col;if(tileCache.has(key))return tileCache.get(key);const c=document.createElement('canvas');c.width=c.height=180;const g=c.getContext('2d');g.imageSmoothingEnabled=true;const w=terrainImage.naturalWidth/2,h=terrainImage.naturalHeight/4;g.drawImage(terrainImage,col*w+3,row*h+3,w-6,h-6,0,0,180,180);tileCache.set(key,c);return c;}
export function background(ctx,map){
 const row=BIOMES.indexOf(map.biome),ready=terrainImage.complete&&terrainImage.naturalWidth>0;
 ctx.clearRect(0,0,360,480);ctx.fillStyle=ready?ctx.createPattern(textureTile(row,0),'repeat'):map.biome.ground[0];ctx.fillRect(0,0,360,480);
 const path=()=>{ctx.beginPath();map.cells.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();};
 ctx.lineJoin='round';ctx.lineCap='square';ctx.strokeStyle='#071c2d99';ctx.lineWidth=39;path();ctx.strokeStyle=map.biome.edge;ctx.lineWidth=35;path();ctx.strokeStyle=ready?ctx.createPattern(textureTile(row,1),'repeat'):map.biome.road;ctx.lineWidth=29;path();
 for(const p of map.pads){ctx.fillStyle='#081e251e';ctx.fillRect(p.x-15,p.y-15,30,30);ctx.strokeStyle='#edf3d622';ctx.lineWidth=1;ctx.strokeRect(p.x-14.5,p.y-14.5,29,29);ctx.fillStyle='#e7f7d6aa';ctx.fillRect(p.x-3,p.y-1,6,2);ctx.fillRect(p.x-1,p.y-3,2,6);}
 const entry=map.cells[1],end=map.cells.at(-2);ctx.fillStyle='#dd7654';ctx.fillRect(entry.x-14,0,28,5);ctx.fillStyle='#72ead0';ctx.fillRect(end.x-15,474,30,6);ctx.fillStyle='#133b3d';ctx.fillRect(end.x-10,467,20,7);ctx.fillStyle='#a7ffe3';ctx.fillRect(end.x-4,465,8,9);
}
export function homeScene(ctx,time){ctx.fillStyle='#12283b';ctx.fillRect(0,0,360,280);const rng=random(777);for(let i=0;i<50;i++){ctx.fillStyle=i%2?'#658093':'#a4ab8d';ctx.fillRect(Math.floor(rng()*360),Math.floor(rng()*180),i%3?1:2,1);}ctx.fillStyle='#dec794';ctx.fillRect(270,30,28,28);ctx.fillStyle='#12283b';ctx.fillRect(264,26,23,26);
 for(let layer=0;layer<2;layer++){for(let i=0;i<14;i++){const x=i*30-15,y=85+Math.floor(rng()*95)+layer*32;ctx.fillStyle=layer?'#19384c':'#1a3045';ctx.fillRect(x,y,27,260-y);ctx.fillRect(x+8,y-7,9,10);for(let wy=y+10;wy<225;wy+=13)for(let wx=x+5;wx<x+24;wx+=9){ctx.fillStyle=rng()>.55?'#b9a36a':'#294b5b';ctx.fillRect(wx,wy,3,5);}}}
 ctx.fillStyle='#0c1e31';ctx.fillRect(0,239,360,41);ctx.fillStyle='#52717a';ctx.fillRect(0,234,360,5);ctx.fillStyle='#213f51';ctx.fillRect(0,239,360,5);for(let i=0;i<12;i++){ctx.fillStyle='#294656';ctx.fillRect(i*34,247,29,2);}
 ctx.fillStyle='#091726';ctx.fillRect(55,235,95,7);ctx.fillRect(206,235,94,7);sprite(ctx,'spider',111,227,2.6,time);sprite(ctx,'iron',249,221+Math.sin(time*2)*3,2.6,time);ctx.fillStyle='#67dce0';ctx.globalAlpha=.3+Math.sin(time*7)*.1;ctx.fillRect(230,234,9,7);ctx.fillRect(251,234,9,7);ctx.globalAlpha=1;
}

// Six authored raster frames per effect; the original PNG atlas is consumed unchanged.
function powerFrame(ctx,row,frame,x,y,size=48,alpha=1){
 if(!powerImage.complete||!powerImage.naturalWidth)return false;
 const cw=powerImage.naturalWidth/6,ch=powerImage.naturalHeight/4;
 ctx.save();ctx.globalAlpha*=alpha;ctx.imageSmoothingEnabled=false;
 ctx.drawImage(powerImage,Math.min(5,Math.max(0,frame))*cw,row*ch,cw,ch,Math.round(x-size/2),Math.round(y-size/2),size,size);ctx.restore();return true;
}
function pixelLine(ctx,x1,y1,x2,y2,color,width=2){
 const dx=x2-x1,dy=y2-y1,n=Math.max(1,Math.ceil(Math.hypot(dx,dy)/2));ctx.fillStyle=color;
 for(let i=0;i<=n;i++){const t=i/n;ctx.fillRect(Math.round((x1+dx*t)/2)*2-width/2,Math.round((y1+dy*t)/2)*2-width/2,width,width);}
}
function orbit(ctx,x,y,r,color,time,count=12){ctx.fillStyle=color;for(let i=0;i<count;i++){const a=i/count*Math.PI*2+time;ctx.fillRect(Math.round((x+Math.cos(a)*r)/2)*2-1,Math.round((y+Math.sin(a)*r)/2)*2-1,3,3);}}
export function drawWebStatus(ctx,enemy,time){
 // Stable woven net makes the slow status distinct from every other power.
 powerFrame(ctx,0,2,enemy.x,enemy.y-6,35,.75+.15*Math.sin(time*4));
}
export function drawProjectile(ctx,p,time){
 const angle=Math.atan2(p.target.y-p.y,p.target.x-p.x),age=p.age||0,phase=Math.floor(age*18)%6;
 if(p.hero==='spider'){
  pixelLine(ctx,p.originX,p.originY,p.x,p.y,'#c9eaff',1);powerFrame(ctx,0,0,p.x,p.y,20);return;
 }
 if(p.hero==='torch'){
  for(let i=3;i>0;i--)powerFrame(ctx,1,1,p.x-Math.cos(angle)*i*5,p.y-Math.sin(angle)*i*5,15+i*3,.13);
  powerFrame(ctx,1,phase%3,p.x,p.y,27);return;
 }
 if(p.hero==='strange'){powerFrame(ctx,3,2+phase%2,p.x,p.y,31);return;}
 ctx.save();ctx.translate(Math.round(p.x),Math.round(p.y));ctx.rotate(angle);
 const rect=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h);};
 if(p.hero==='iron'){
  rect(-12,-2,6+(phase%2)*3,4,'#ff743b');rect(-9,-1,6,2,'#fff2b3');rect(-5,-3,10,6,'#252e42');rect(-5,-2,10,4,'#d6dde0');rect(-3,-2,5,1,'#fff9e5');rect(4,-2,3,4,'#e4574f');rect(7,-1,2,2,'#f1b364');rect(-5,-5,3,2,'#9baabc');rect(-5,3,3,2,'#9baabc');
 }else if(p.hero==='hawkeye'){
  rect(-11,-1,18,2,'#d1aa73');rect(-12,-3,4,6,'#b994e7');rect(5,-2,4,4,'#e8f3f4');rect(9,-1,2,2,'#fff6da');
 }else if(p.hero==='thor'){
  ctx.rotate(age*15);rect(-2,-1,4,12,'#9c7647');rect(-1,-1,1,9,'#e3c08e');rect(-7,-8,14,9,'#526a83');rect(-6,-7,12,6,'#d0e6eb');rect(-5,-7,10,2,'#f4ffff');rect(-5,-1,10,2,'#8299b3');
 }else if(p.hero==='cap'){
  ctx.rotate(age*20);orbit(ctx,0,0,8,'#ed5b60',0,28);orbit(ctx,0,0,6,'#f2edcf',0,24);rect(-4,-4,8,8,'#4b82b6');rect(-1,-3,2,6,'#f8f3d9');rect(-3,-1,6,2,'#f8f3d9');
 }else{rect(-3,-2,6,4,HEROES[p.hero].color);}
 ctx.restore();if(p.hero==='thor')powerFrame(ctx,2,phase%3,p.x,p.y,24,.45);
}
export function drawEffect(ctx,f,time){
 const progress=1-f.life/f.maxLife,frame=Math.min(5,Math.floor(progress*6));
 if(f.type==='web'){powerFrame(ctx,0,frame,f.x,f.y,46);return;}
 if(f.type==='explosion'){powerFrame(ctx,1,frame,f.x,f.y,f.size||60);return;}
 if(f.type==='lightning'){powerFrame(ctx,2,frame,f.x,f.y,f.size||60);return;}
 if(f.type==='magic'){powerFrame(ctx,3,frame,f.x,f.y,f.size||52);return;}
 ctx.save();ctx.globalAlpha=Math.min(1,(1-progress)*2);
 if(f.type==='line'){
  const width=Math.max(2,(f.width||3)*(1-progress*.65));
  pixelLine(ctx,f.x,f.y,f.x2,f.y2,f.color,width);
  pixelLine(ctx,f.x,f.y,f.x2,f.y2,'#fff8df',Math.max(1,width*.3));
  if(width>10){const t=.25+.5*progress;powerFrame(ctx,2,frame,f.x+(f.x2-f.x)*t,f.y+(f.y2-f.y)*t,width*1.6,.6);}
 }else if(f.type==='ring'){
  const r=(f.radius||35)*(.15+progress*.85);orbit(ctx,f.x,f.y,r,f.color,time*.3,Math.max(24,Math.round(r*1.5)));orbit(ctx,f.x,f.y,r*.88,'#e3f6c0',-time*.3,24);
  if(f.color==='#60f6ba'||f.color==='#66e9c0')powerFrame(ctx,3,frame,f.x,f.y,Math.min(110,r*1.5));
  if(f.color==='#ff8b47')powerFrame(ctx,1,frame,f.x,f.y,Math.min(140,r*1.6));
 }else{
  const r=4+progress*18;orbit(ctx,f.x,f.y,r,f.color,0,8);if(progress<.35){ctx.fillStyle='#fff0ab';ctx.fillRect(f.x-3,f.y-3,6,6);}
 }
 ctx.restore();
}
