export const W=360,H=480,TILE=40;
export const HEROES={
 spider:{name:'Homem-Aranha',short:'ARANHA',role:'CONTROLE',color:'#f04d55',cost:100,unlock:0,range:108,rate:.8,damage:0,charge:22,skill:'Teia pegajosa',desc:'Teias dão lentidão, sem dano. Só dispara em alvos ainda sem teia.',ultimate:'Teia de recuo',ultDesc:'Puxa os inimigos presos no alcance 3 blocos para trás.'},
 iron:{name:'Homem de Ferro',short:'FERRO',role:'EXPLOSÃO',color:'#ffc85a',cost:160,unlock:0,range:128,rate:1.05,damage:30,charge:25,skill:'Mísseis guiados',desc:'Mísseis explodem e atingem inimigos próximos.',ultimate:'Unibeam',ultDesc:'Raio em direção ao primeiro alvo. Alcance de 4 blocos e largura de 1 bloco.'},
 hulk:{name:'Hulk',short:'HULK',role:'ÁREA',color:'#83d75b',cost:200,unlock:3,range:76,rate:1.45,damage:48,charge:26,skill:'Esmagar',desc:'Soco no chão causa dano em área ao redor do alvo.',ultimate:'Fúria gama',ultDesc:'Explosão de 3 blocos ao redor de Hulk. Atordoa por 3 segundos.'},
 thor:{name:'Thor',short:'THOR',role:'CORRENTE',color:'#99d6ff',cost:220,unlock:4,range:116,rate:1.3,damage:33,charge:28,skill:'Mjölnir',desc:'O martelo salta entre até 3 inimigos próximos.',ultimate:'Tempestade',ultDesc:'Raios atingem até 8 inimigos no alcance.'},
 torch:{name:'Tocha Humana',short:'TOCHA',role:'QUEIMADURA',color:'#ff8b47',cost:180,unlock:4,range:108,rate:.8,damage:14,charge:24,skill:'Bola de fogo',desc:'Queima o alvo por 4 segundos com dano contínuo.',ultimate:'Supernova',ultDesc:'Incendeia todos os inimigos em um raio de 3 blocos.'},
 hawkeye:{name:'Gavião Arqueiro',short:'ARQUEIRO',role:'PRECISÃO',color:'#c197ff',cost:140,unlock:3,range:160,rate:.75,damage:24,charge:23,skill:'Flecha precisa',desc:'Alcance longo e flechas que ignoram armaduras.',ultimate:'Chuva de flechas',ultDesc:'Até 6 alvos no alcance recebem três flechas cada.'},
 cap:{name:'Capitão América',short:'CAPITÃO',role:'ATORDOAR',color:'#78acff',cost:180,unlock:5,range:100,rate:1.1,damage:28,charge:25,skill:'Escudo ricochete',desc:'Atinge 2 inimigos e atordoa brevemente.',ultimate:'Avante!',ultDesc:'Dano e recuo de 2 blocos nos inimigos próximos.'},
 strange:{name:'Doutor Estranho',short:'ESTRANHO',role:'PORTAIS',color:'#66e9c0',cost:240,unlock:6,range:120,rate:1.1,damage:28,charge:32,skill:'Disco místico',desc:'Energia mística desacelera e atravessa armaduras.',ultimate:'Laço temporal',ultDesc:'Rebobina 4 blocos e paralisa os alvos no alcance.'},
 cyclops:{name:'Ciclope',short:'CICLOPE',role:'PERFURAÇÃO',color:'#ff797b',cost:200,unlock:5,range:140,rate:.95,damage:26,charge:27,skill:'Rajada óptica',desc:'Raio perfura alvos em uma linha de até 3,5 blocos.',ultimate:'Explosão óptica',ultDesc:'Raio de 5 blocos com dano elevado e largura de 1 bloco.'}
};
export const BIOMES=[{name:'CENTRAL PARK',sub:'Nova York',ground:['#284d42','#31594a','#3b6350'],road:'#a39778',edge:'#655f52',accent:'#b5d293'},{name:'DISTRITO STARK',sub:'Manhattan',ground:['#233849','#2c4353','#345264'],road:'#647883',edge:'#394f5e',accent:'#6ce1e9'},{name:'RUÍNAS DE ASGARD',sub:'Os nove reinos',ground:['#43385e','#504269','#5d4e76'],road:'#9b849c',edge:'#685569',accent:'#e3bf74'},{name:'ZONA GAMA',sub:'Laboratório abandonado',ground:['#334833','#3c5339','#476340'],road:'#8e9670',edge:'#646b4e',accent:'#b0e66a'}];
export function random(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
export function generateMap(seed,stage=1){
 const rng=random(seed+stage*917),cells=[],add=(c,r)=>{if(!cells.some(p=>p.c===c&&p.r===r))cells.push({c,r,x:c*40+20,y:r*40+20});};
 let c=1+Math.floor(rng()*3);add(c,-1);add(c,0);
 for(const r of [1,4,7,10]){while(cells.at(-1).r<r)add(c,cells.at(-1).r+1);const target=c<4?5+Math.floor(rng()*3):1+Math.floor(rng()*3);const dir=Math.sign(target-c);while(c!==target){c+=dir;add(c,r);}}
 add(c,11);add(c,12);
 const pathSet=new Set(cells.map(p=>`${p.c},${p.r}`)),pads=[];
 for(let r=0;r<12;r++)for(let c=0;c<9;c++)if(!pathSet.has(`${c},${r}`))pads.push({c,r,x:c*40+20,y:r*40+20});
 return{seed,cells,pads,pathSet,length:(cells.length-1)*40,biome:BIOMES[(stage-1)%4]};
}
export function position(map,d){const n=Math.max(0,Math.min(map.cells.length-1.001,d/40)),i=Math.floor(n),a=map.cells[i],b=map.cells[i+1]||a,t=n-i;return{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,dx:b.x-a.x,dy:b.y-a.y};}
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export const freshSave=()=>({version:2,stage:1,coins:0,diamonds:0,unlocked:{spider:true,iron:true},upgrades:{},wins:0,kills:0,best:1,sound:true,starterGrant:false});
export function normalizeSave(s){const d=freshSave();if(!s||typeof s!=='object')return d;for(const k of ['stage','coins','diamonds','wins','kills','best'])d[k]=Math.max(k==='stage'||k==='best'?1:0,Math.min(1e9,Math.floor(Number(s[k])||d[k])));for(const id of Object.keys(HEROES)){d.unlocked[id]=id==='spider'||id==='iron'||s.unlocked?.[id]===true;d.upgrades[id]=Math.min(10,Math.max(1,Math.floor(Number(s.upgrades?.[id])||1)));}d.sound=s.sound!==false;d.starterGrant=s.starterGrant===true;return d;}
export const upgradeCost=level=>100*level;
export function grantStarter(save){if(save.starterGrant)return false;save.coins+=500;save.starterGrant=true;return true;}
export function purchaseQuote(save,id){
 const h=HEROES[id];if(!h)return null;const level=save.upgrades[id]||1;
 if(save.unlocked[id]){const gold=upgradeCost(level),max=level>=10;return{kind:'upgrade',gold,diamonds:0,convert:0,missing:Math.max(0,gold-save.coins),affordable:!max&&save.coins>=gold,max};}
 const diamonds=Math.min(save.diamonds,h.unlock),convert=h.unlock-diamonds,gold=convert*100;
 return{kind:'unlock',gold,diamonds,convert,missing:Math.max(0,gold-save.coins),affordable:save.coins>=gold,max:false};
}
export function purchase(save,id){const q=purchaseQuote(save,id);if(!q||!q.affordable)return false;save.coins-=q.gold;save.diamonds-=q.diamonds;if(q.kind==='unlock'){save.unlocked[id]=true;save.upgrades[id]=1;}else save.upgrades[id]=(save.upgrades[id]||1)+1;return true;}
export function heroStats(id,level=1){const h=HEROES[id];return{level,range:h.range+(id==='spider'?(level-1)*2:0),damage:h.damage*(1+(level-1)*.18),rate:h.rate/(1+(level-1)*.04),webDuration:3+(level-1)*.35,webFactor:Math.max(.25,.45-(level-1)*.02)};}
export function exchange(save,n=1){if(!Number.isInteger(n)||n<1||save.coins<n*100)return false;save.coins-=n*100;save.diamonds+=n;return true;}
export class Battle{
 constructor(save,seed=Date.now()%2147483647){this.save=save;this.stage=save.stage;this.seed=seed;this.rng=random(seed);this.map=generateMap(seed,this.stage);this.towers=[];this.enemies=[];this.shots=[];this.effects=[];this.events=[];this.energy=420;this.lives=20;this.wave=0;this.totalWaves=5+Math.min(3,Math.floor((this.stage-1)/4));this.time=0;this.queue=[];this.active=false;this.ended=false;this.kills=0;this.spawnTimer=0;this.nextId=1;this.reward=null;}
 emit(type,data={}){this.events.push({type,...data});}
 place(id,c,r){const h=HEROES[id];if(this.ended||!h||!this.save.unlocked[id])return{error:'Herói bloqueado'};if(this.towers.length>=12)return{error:'Limite de 12 heróis'};if(!this.map.pads.some(p=>p.c===c&&p.r===r))return{error:'Escolha um bloco fora do caminho'};if(this.towers.some(t=>t.c===c&&t.r===r))return{error:'Bloco ocupado'};if(this.energy<h.cost)return{error:'Energia insuficiente'};this.energy-=h.cost;const lvl=this.save.upgrades[id]||1,t={id:this.nextId++,hero:id,c,r,x:c*40+20,y:r*40+20,...heroStats(id,lvl),cool:.12,charge:0,anim:0,dir:1,level:lvl};this.towers.push(t);this.emit('place');return{tower:t};}
 applyUpgrade(id){for(const t of this.towers)if(t.hero===id)Object.assign(t,heroStats(id,this.save.upgrades[id]||1));}
 sell(t){if(this.ended)return;if(!this.towers.includes(t))return;this.energy+=Math.floor(HEROES[t.hero].cost*.65);this.towers=this.towers.filter(x=>x!==t);}
 startWave(){if(this.active||this.ended)return false;this.wave++;this.active=true;this.spawnTimer=.6;const count=6+this.wave*2+Math.min(20,this.stage*2);this.queue=[];for(let i=0;i<count;i++){const roll=this.rng();let type=this.stage>=2&&roll<.22?'brute':roll>.7?'runner':'drone';if(this.wave===this.totalWaves&&i===count-1)type='boss';this.queue.push(type);}this.emit('wave');return true;}
 spawn(type){const scale=1+(this.stage-1)*.26+(this.wave-1)*.16,base={drone:[44,24,10],runner:[32,39,12],brute:[115,18,18],boss:[380,14,65]}[type];const hp=base[0]*scale;this.enemies.push({id:this.nextId++,type,d:0,hp,maxHp:hp,speed:base[1]*(1+Math.min(.4,this.stage*.012)),bounty:base[2],slow:0,web:0,webFactor:.45,stun:0,burn:0,burnDmg:0,dead:false,x:this.map.cells[0].x,y:-20});}
 damage(e,n,pierce=false){if(e.dead)return;e.hp-=n*(e.type==='brute'&&!pierce?.68:1);if(e.hp<=0){e.dead=true;this.kills++;this.energy+=e.bounty;this.effect('burst',e.x,e.y,'#ffca62',.35);this.emit('kill');}}
 effect(type,x,y,color,life=.4,extra={}){this.effects.push({type,x,y,color,life,maxLife:life,...extra});}
 targets(t,r=t.range){return this.enemies.filter(e=>!e.dead&&distance(e,t)<=r).sort((a,b)=>b.d-a.d);}
 fire(t,e){t.anim=.32;t.dir=e.x<t.x?-1:1;const h=t.hero;
 if(h==='cyclops'){this.beam(t,e,140,14,t.damage,'#ff4d68');return;}
 if(h==='hulk'){this.effect('ring',e.x,e.y,'#9be879',.4,{radius:45});for(const a of this.targets(e,45))this.damage(a,t.damage);return;}
 this.shots.push({x:t.x,y:t.y-12,target:e,tower:t,hero:h,damage:t.damage,dead:false});
 }
 impact(p){const e=p.target,t=p.tower,h=p.hero;if(h==='spider'){if(!e.dead&&e.web<=0){e.web=t.webDuration;e.webFactor=t.webFactor;this.effect('web',e.x,e.y,'#e1f7ff',.35);}return;}this.damage(e,p.damage,h==='hawkeye'||h==='strange');
 if(h==='iron'){this.effect('burst',e.x,e.y,'#ffb44c',.4);for(const a of this.targets(e,36))if(a!==e)this.damage(a,p.damage*.55);}
 if(h==='torch'){e.burn=4;e.burnDmg=p.damage*.48;this.effect('burst',e.x,e.y,'#ff7a33',.35);}
 if(h==='strange'){e.slow=2.4;this.effect('ring',e.x,e.y,'#60f6ba',.3,{radius:20});}
 if(h==='thor'||h==='cap'){if(h==='cap')e.stun=.55;const near=this.targets(e,70).filter(a=>a!==e).slice(0,h==='thor'?2:1);let prev=e;for(const a of near){this.effect('line',prev.x,prev.y,HEROES[h].color,.25,{x2:a.x,y2:a.y,width:3});this.damage(a,p.damage*.7);if(h==='cap')a.stun=.4;prev=a;}}
 }
 beam(t,target,length,width,damage,color){const dx=target.x-t.x,dy=target.y-t.y,d=Math.hypot(dx,dy)||1,ux=dx/d,uy=dy/d;this.effect('line',t.x,t.y,color,.48,{x2:t.x+ux*length,y2:t.y+uy*length,width});for(const e of this.enemies){const x=e.x-t.x,y=e.y-t.y,along=x*ux+y*uy,across=Math.abs(x*uy-y*ux);if(along>=0&&along<=length&&across<=width/2+7)this.damage(e,damage,true);}}
 ultimate(t){if(this.ended||!this.towers.includes(t)||t.charge<100)return{error:'Ultimate ainda carregando'};let targets=this.targets(t,t.hero==='hulk'||t.hero==='torch'?120:t.range);if(t.hero==='spider')targets=targets.filter(e=>e.web>0);if(!targets.length)return{error:t.hero==='spider'?'Nenhum inimigo preso nas teias por perto':'Nenhum inimigo no alcance'};t.charge=0;t.anim=.8;this.emit('ultimate',{hero:t.hero});const h=t.hero;
 if(h==='iron'||h==='cyclops'){this.beam(t,targets[0],h==='iron'?160:200,40,t.damage*5,HEROES[h].color);}
 else if(h==='spider'||h==='strange'||h==='cap'){for(const e of targets){e.d=Math.max(0,e.d-(h==='strange'?160:h==='spider'?120:80));if(h==='spider')e.web=Math.max(e.web,t.webDuration);else e.slow=3;if(h==='strange')e.stun=2;if(h==='cap')this.damage(e,t.damage*3);const p=position(this.map,e.d);this.effect('line',e.x,e.y,HEROES[h].color,.6,{x2:p.x,y2:p.y,width:3});e.x=p.x;e.y=p.y;}this.effect('ring',t.x,t.y,HEROES[h].color,.6,{radius:t.range});}
 else if(h==='hulk'||h==='torch'){for(const e of targets){this.damage(e,t.damage*(h==='hulk'?3:5));if(h==='hulk')e.stun=3;else{e.burn=6;e.burnDmg=t.damage;}}this.effect('ring',t.x,t.y,HEROES[h].color,.8,{radius:120});}
 else {for(const e of targets.slice(0,h==='thor'?8:6)){this.damage(e,t.damage*3);this.effect('line',e.x-18,e.y-90,HEROES[h].color,.6,{x2:e.x,y2:e.y,width:5});}}
 return{ok:true};}
 finish(won){if(this.ended)return;this.ended=true;this.active=false;this.reward={won,coins:won?200+this.stage*60+this.lives*3:Math.floor(this.kills*2),diamonds:won&&this.stage%3===0?1:0,stars:this.lives>=18?3:this.lives>=10?2:1};this.save.coins+=this.reward.coins;this.save.diamonds+=this.reward.diamonds;this.save.kills+=this.kills;if(won){this.save.wins++;this.save.stage++;this.save.best=Math.max(this.save.best,this.save.stage);}this.emit('finish',this.reward);}
 update(dt){if(this.ended)return;this.time+=dt;for(const fx of this.effects)fx.life-=dt;this.effects=this.effects.filter(x=>x.life>0);
 if(this.active){this.spawnTimer-=dt;if(this.queue.length&&this.spawnTimer<=0){this.spawn(this.queue.shift());this.spawnTimer=Math.max(.36,.88-this.stage*.018);}}
 for(const e of this.enemies){if(e.dead)continue;e.slow=Math.max(0,e.slow-dt);e.web=Math.max(0,e.web-dt);e.stun=Math.max(0,e.stun-dt);if(e.burn>0){e.burn-=dt;this.damage(e,e.burnDmg*dt,true);}if(e.dead)continue;if(!e.stun)e.d+=e.speed*Math.min(e.slow>0?.45:1,e.web>0?e.webFactor:1)*dt;const p=position(this.map,e.d);e.x=p.x;e.y=p.y;e.dir=p.dx<0?-1:1;if(e.d>=this.map.length){e.dead=true;this.lives-=e.type==='boss'?5:1;this.emit('leak');if(this.lives<=0){this.lives=0;this.finish(false);return;}}}
 for(const t of this.towers){t.anim=Math.max(0,t.anim-dt);if(!this.active)continue;t.charge=Math.min(100,t.charge+100/HEROES[t.hero].charge*dt);t.cool-=dt;if(t.cool<=0){const e=this.targets(t).find(e=>t.hero!=='spider'||(e.web<=0&&!this.shots.some(p=>!p.dead&&p.hero==='spider'&&p.target===e)));if(e){this.fire(t,e);t.cool=t.rate;}}}
 for(const p of this.shots){if(p.target.dead){p.dead=true;continue;}const d=distance(p,p.target),step=260*dt;if(d<=step){p.x=p.target.x;p.y=p.target.y;this.impact(p);p.dead=true;}else{p.x+=(p.target.x-p.x)/d*step;p.y+=(p.target.y-p.y)/d*step;}}
 this.enemies=this.enemies.filter(e=>!e.dead);this.shots=this.shots.filter(p=>!p.dead);
 if(this.active&&!this.queue.length&&!this.enemies.length){this.active=false;this.shots=[];if(this.wave>=this.totalWaves)this.finish(true);else{this.energy+=70;this.emit('waveEnd');}}
 }
}
