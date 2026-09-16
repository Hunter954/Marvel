const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

const screens = {
  home: $("#home"),
  heroes: $("#heroes"),
  game: $("#game"),
  result: $("#result")
};

const state = {
  stage: 1,
  coins: 0,
  diamonds: 0,
  selectedHero: "spider",
  lives: 20,
  battleCoins: 420,
  wave: 1,
  totalWaves: 5,
  paused: false,
  running: false,
  enemies: [],
  towers: [],
  projectiles: [],
  effects: [],
  path: [],
  tiles: [],
  spawnQueue: [],
  lastTime: 0,
  waveActive: false,
  nextWaveAt: 0,
  reward: 0,
  unlocked: { spider: true, iron: true },
  upgrades: { spider: 1, iron: 1 }
};

const HEROES = {
  spider: {
    name: "Homem-Aranha",
    cost: 120,
    color: "#d92828",
    range: 118,
    rate: 820,
    damage: 7,
    slow: 0.45,
    ultimateNeed: 100,
    desc: "Teia desacelera inimigos. Ultimate puxa inimigos para trás."
  },
  iron: {
    name: "Homem de Ferro",
    cost: 180,
    color: "#ffd232",
    range: 145,
    rate: 1080,
    damage: 22,
    ultimateNeed: 100,
    desc: "Mísseis de alto dano. Ultimate dispara um super raio."
  }
};

const LOCKED = [
  ["hulk","Hulk",3],
  ["thor","Thor",4],
  ["torch","Tocha Humana",5],
  ["hawkeye","Gavião Arqueiro",6],
  ["cap","Capitão América",7],
  ["strange","Doutor Estranho",8],
  ["cyclops","Ciclope",9]
];

function load() {
  try {
    const save = JSON.parse(localStorage.getItem("mtd-save") || "{}");
    Object.assign(state, {
      stage: save.stage || 1,
      coins: save.coins || 0,
      diamonds: save.diamonds || 0,
      unlocked: { spider: true, iron: true, ...(save.unlocked || {}) },
      upgrades: { spider: 1, iron: 1, ...(save.upgrades || {}) }
    });
  } catch {}
}

function save() {
  localStorage.setItem("mtd-save", JSON.stringify({
    stage: state.stage,
    coins: state.coins,
    diamonds: state.diamonds,
    unlocked: state.unlocked,
    upgrades: state.upgrades
  }));
}

function show(name) {
  Object.values(screens).forEach(el => el.classList.remove("active"));
  screens[name].classList.add("active");
  if (name === "home") updateHome();
  if (name === "heroes") renderShop();
}

function updateHome() {
  $("#homeCoins").textContent = state.coins;
  $("#homeDiamonds").textContent = state.diamonds;
  $("#homeStage").textContent = state.stage;
}

function renderShop() {
  $("#shopCoins").textContent = state.coins;
  $("#shopDiamonds").textContent = state.diamonds;
  const grid = $("#heroGrid");
  grid.innerHTML = "";

  const entries = [
    ["spider","Homem-Aranha",null],
    ["iron","Homem de Ferro",null],
    ...LOCKED
  ];

  for (const [id,name,diamondCost] of entries) {
    const unlocked = !!state.unlocked[id];
    const card = document.createElement("article");
    card.className = `hero-shop-card ${unlocked ? "unlocked" : "locked"}`;
    const level = state.upgrades[id] || 1;
    const spriteClass = id === "spider" || id === "iron" ? id : "";
    card.innerHTML = `
      ${unlocked ? "" : '<span class="lock">🔒</span>'}
      <span class="mini-sprite ${spriteClass}"></span>
      <h3>${name}</h3>
      <p>${id === "spider" ? HEROES.spider.desc : id === "iron" ? HEROES.iron.desc : "Herói bloqueado. Libere com diamantes para adicionar novas estratégias."}</p>
      <button>${unlocked ? `UPGRADE LV.${level} · 🪙 ${level*350}` : `DESBLOQUEAR · 💎 ${diamondCost}`}</button>
    `;
    card.querySelector("button").onclick = () => {
      if (unlocked) {
        const price = level * 350;
        if (state.coins < price) return toast("Moedas insuficientes");
        state.coins -= price;
        state.upgrades[id] = level + 1;
      } else {
        if (state.diamonds < diamondCost) return toast("Diamantes insuficientes");
        state.diamonds -= diamondCost;
        state.unlocked[id] = true;
        state.upgrades[id] = 1;
      }
      save();
      renderShop();
    };
    grid.appendChild(card);
  }
}

function toast(text) {
  const m = $("#message");
  m.textContent = text;
  m.classList.add("show");
  clearTimeout(toast.t);
  toast.t = setTimeout(() => m.classList.remove("show"), 1600);
}

const canvas = $("#gameCanvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  buildMap(rect.width, rect.height);
}

function rand(seed) {
  let x = Math.sin(seed * 999.91) * 43758.5453;
  return x - Math.floor(x);
}

function buildMap(w, h) {
  state.tiles = [];
  const seed = state.stage * 31;
  const margin = 28;
  const cols = 6;
  const rows = 10;
  const cw = (w - margin*2) / cols;
  const rh = h / rows;

  let col = Math.floor(rand(seed) * cols);
  const points = [{x: margin + col*cw + cw/2, y: -20}];
  for (let r=0;r<rows;r++) {
    const shift = rand(seed+r*7);
    if (shift < .32) col = Math.max(0, col-1);
    else if (shift > .68) col = Math.min(cols-1, col+1);
    points.push({x: margin + col*cw + cw/2, y: r*rh + rh/2});
  }
  points.push({x: points.at(-1).x, y:h+25});

  state.path = densify(points, 16);

  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      const x=margin+c*cw+cw/2, y=r*rh+rh/2;
      const near = distanceToPath(x,y) < Math.min(cw,rh)*.65;
      if(!near) state.tiles.push({x,y,r:Math.min(cw,rh)*.34});
    }
  }
}

function densify(points, step) {
  const out=[];
  for(let i=0;i<points.length-1;i++){
    const a=points[i], b=points[i+1];
    const d=Math.hypot(b.x-a.x,b.y-a.y);
    const n=Math.max(1,Math.ceil(d/step));
    for(let j=0;j<n;j++){
      const t=j/n;
      out.push({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
    }
  }
  out.push(points.at(-1));
  return out;
}

function distanceToPath(x,y){
  let best=9999;
  for(const p of state.path) best=Math.min(best,Math.hypot(p.x-x,p.y-y));
  return best;
}

function startGame() {
  state.lives = 20;
  state.battleCoins = 420 + Math.min(240, state.stage*15);
  state.wave = 1;
  state.totalWaves = 5 + Math.floor((state.stage-1)/4);
  state.enemies = [];
  state.towers = [];
  state.projectiles = [];
  state.effects = [];
  state.spawnQueue = [];
  state.waveActive = false;
  state.nextWaveAt = performance.now()+900;
  state.running = true;
  state.paused = false;
  show("game");
  requestAnimationFrame(() => {
    resizeCanvas();
    updateHUD();
  });
}

function startWave() {
  const difficulty = 1 + (state.stage-1)*0.17 + (state.wave-1)*0.12;
  const count = 5 + state.wave*2 + Math.floor(state.stage*0.7);
  state.spawnQueue = [];
  for(let i=0;i<count;i++){
    const armored = state.stage >= 3 && Math.random() < Math.min(.35, .07*state.stage);
    const fast = state.stage >= 2 && Math.random() < .22;
    state.spawnQueue.push({
      at: performance.now() + i*(680 - Math.min(260,state.stage*12)),
      hp: (armored?100:55)*difficulty*(fast?.82:1),
      maxHp: (armored?100:55)*difficulty*(fast?.82:1),
      speed: (fast?38:25) * (1 + state.stage*.018),
      progress:0,
      slowUntil:0,
      armored,
      fast,
      gold: armored?22:fast?14:10
    });
  }
  state.waveActive=true;
}

function updateHUD(){
  $("#lives").textContent=state.lives;
  $("#battleCoins").textContent=Math.floor(state.battleCoins);
  $("#stageLabel").textContent=state.stage;
  $("#waveLabel").textContent=`${state.wave}/${state.totalWaves}`;
}

function spawnDue(now){
  while(state.spawnQueue.length && state.spawnQueue[0].at<=now){
    state.enemies.push(state.spawnQueue.shift());
  }
}

function update(dt, now){
  if(!state.running || state.paused) return;
  if(!state.waveActive && now>=state.nextWaveAt) startWave();
  spawnDue(now);

  for(const e of state.enemies){
    const slow = now < e.slowUntil ? .48 : 1;
    e.progress += e.speed*slow*dt/16;
    if(e.progress >= state.path.length-1){
      e.dead=true; e.escaped=true; state.lives--;
    }
  }

  for(const t of state.towers){
    t.charge = Math.min(100,t.charge + dt*.006);
    t.cool -= dt;
    if(t.cool<=0){
      let best=null,bestD=9999;
      for(const e of state.enemies){
        if(e.dead) continue;
        const p=state.path[Math.min(state.path.length-1,Math.floor(e.progress))];
        const d=Math.hypot(p.x-t.x,p.y-t.y);
        if(d<t.range && d<bestD){best=e;bestD=d;}
      }
      if(best){
        fire(t,best);
        t.cool=t.rate;
      }
    }
  }

  for(const p of state.projectiles){
    const e=p.target;
    if(!e || e.dead){p.dead=true;continue;}
    const ep=state.path[Math.min(state.path.length-1,Math.floor(e.progress))];
    const dx=ep.x-p.x,dy=ep.y-p.y,d=Math.hypot(dx,dy);
    if(d<8){
      hit(p,e,now); p.dead=true;
    }else{
      const sp=.42*dt;
      p.x += dx/d*sp; p.y += dy/d*sp;
    }
  }

  state.enemies=state.enemies.filter(e=>{
    if(e.hp<=0 && !e.dead){e.dead=true;state.battleCoins+=e.gold;}
    return !e.dead;
  });
  state.projectiles=state.projectiles.filter(p=>!p.dead);

  if(state.lives<=0){
    state.running=false;
    setTimeout(()=>{show("home");toast("A cidade caiu. Tente outra estratégia.");},400);
  }

  if(state.waveActive && !state.spawnQueue.length && !state.enemies.length){
    state.waveActive=false;
    if(state.wave>=state.totalWaves){
      completeStage();
    }else{
      state.wave++;
      state.battleCoins += 90 + state.stage*4;
      state.nextWaveAt = now+1800;
      toast(`Onda ${state.wave} chegando`);
    }
  }
  updateHUD();
}

function fire(t,e){
  state.projectiles.push({x:t.x,y:t.y,target:e,hero:t.hero,damage:t.damage});
}

function hit(p,e,now){
  if(p.hero==="spider"){
    e.hp-=p.damage;
    e.slowUntil=Math.max(e.slowUntil,now+1900);
  }else{
    e.hp-=p.damage;
    state.effects.push({x:p.x,y:p.y,t:250,type:"boom"});
  }
}

function completeStage(){
  state.running=false;
  const reward=220+state.stage*65;
  const diamond=state.stage%3===0?1:0;
  state.coins+=reward;
  state.diamonds+=diamond;
  $("#rewardCoins").textContent=reward;
  $("#rewardDiamonds").textContent=diamond;
  $("#rewardDiamondWrap").style.display=diamond?"inline-block":"none";
  state.stage++;
  save();
  setTimeout(()=>show("result"),350);
}

function draw(){
  const w=canvas.clientWidth,h=canvas.clientHeight;
  ctx.clearRect(0,0,w,h);

  const palettes=[
    ["#284d35","#386c45","#4c8052"],
    ["#2d455b","#3a5971","#496b82"],
    ["#493c31","#665142","#7b6350"]
  ];
  const pal=palettes[(state.stage-1)%palettes.length];
  ctx.fillStyle=pal[0];ctx.fillRect(0,0,w,h);

  for(let i=0;i<70;i++){
    const x=(rand(i*3+state.stage)*w)|0,y=(rand(i*9+12)*h)|0;
    ctx.fillStyle=i%2?pal[1]:pal[2];
    ctx.fillRect(x,y,2,2);
  }

  ctx.lineCap="square";
  ctx.lineJoin="round";
  ctx.strokeStyle="#6f7780";
  ctx.lineWidth=30;
  pathStroke();
  ctx.strokeStyle="#aab0b4";
  ctx.lineWidth=22;
  pathStroke();
  ctx.setLineDash([5,8]);
  ctx.strokeStyle="#d7d7c6";
  ctx.lineWidth=2;
  pathStroke();
  ctx.setLineDash([]);

  for(const tile of state.tiles){
    ctx.fillStyle="rgba(9,20,18,.25)";
    ctx.fillRect(tile.x-tile.r,tile.y-tile.r,tile.r*2,tile.r*2);
    ctx.strokeStyle="rgba(255,255,255,.08)";
    ctx.strokeRect(tile.x-tile.r,tile.y-tile.r,tile.r*2,tile.r*2);
  }

  for(const t of state.towers) drawTower(t);
  for(const e of state.enemies) drawEnemy(e);
  for(const p of state.projectiles) drawProjectile(p);
  drawUltimateBars();

  if(!state.waveActive && state.running){
    ctx.fillStyle="rgba(5,10,20,.78)";
    ctx.fillRect(0,h/2-32,w,64);
    ctx.fillStyle="#fff";
    ctx.font="900 14px monospace";
    ctx.textAlign="center";
    ctx.fillText(`ONDA ${state.wave} PREPARANDO`,w/2,h/2+5);
  }
}

function pathStroke(){
  if(state.path.length<2)return;
  ctx.beginPath();
  ctx.moveTo(state.path[0].x,state.path[0].y);
  for(const p of state.path)ctx.lineTo(p.x,p.y);
  ctx.stroke();
}

function drawTower(t){
  ctx.save();
  ctx.translate(t.x,t.y);
  ctx.fillStyle="#10151d";ctx.fillRect(-16,10,32,8);
  if(t.hero==="spider"){
    ctx.fillStyle="#173b99";ctx.fillRect(-10,-5,20,18);
    ctx.fillStyle="#d92828";ctx.fillRect(-9,-19,18,17);
    ctx.fillStyle="#fff";ctx.fillRect(-6,-13,4,3);ctx.fillRect(2,-13,4,3);
    ctx.fillStyle="#d92828";ctx.fillRect(-17,-2,7,15);ctx.fillRect(10,-2,7,15);
  }else{
    ctx.fillStyle="#b51e26";ctx.fillRect(-11,-7,22,21);
    ctx.fillStyle="#ffd232";ctx.fillRect(-9,-21,18,17);ctx.fillRect(-8,-18,16,4);
    ctx.fillStyle="#6ee7ff";ctx.fillRect(-2,-2,4,4);
    ctx.fillStyle="#b51e26";ctx.fillRect(-18,-4,7,17);ctx.fillRect(11,-4,7,17);
  }
  ctx.restore();
}

function drawEnemy(e){
  const p=state.path[Math.min(state.path.length-1,Math.floor(e.progress))];
  ctx.save();ctx.translate(p.x,p.y);
  const bob=Math.sin(e.progress*.45)*2;
  ctx.translate(0,bob);
  ctx.fillStyle=e.armored?"#6d7584":e.fast?"#cf3f6f":"#563c73";
  ctx.fillRect(-10,-15,20,22);
  ctx.fillStyle=e.armored?"#abb3c2":"#89d36d";
  ctx.fillRect(-8,-24,16,12);
  ctx.fillStyle="#111";ctx.fillRect(-4,-20,3,3);ctx.fillRect(2,-20,3,3);
  ctx.fillStyle="#24202e";ctx.fillRect(-8,7,6,10);ctx.fillRect(2,7,6,10);
  ctx.fillStyle="#111";ctx.fillRect(-14,-31,28,4);
  ctx.fillStyle="#4bdf69";ctx.fillRect(-14,-31,28*Math.max(0,e.hp/e.maxHp),4);
  if(e.slowUntil>performance.now()){ctx.strokeStyle="#e7f8ff";ctx.strokeRect(-13,-27,26,47);}
  ctx.restore();
}

function drawProjectile(p){
  ctx.fillStyle=p.hero==="spider"?"#f4f4f4":"#ffcf32";
  ctx.fillRect(p.x-3,p.y-3,6,6);
}

function drawUltimateBars(){
  for(const t of state.towers){
    ctx.fillStyle="#07111f";ctx.fillRect(t.x-18,t.y+23,36,5);
    ctx.fillStyle=t.charge>=100?"#3cff65":"#1c8e39";
    ctx.fillRect(t.x-17,t.y+24,34*(t.charge/100),3);
  }
}

function towerAt(x,y){
  return state.towers.find(t=>Math.hypot(t.x-x,t.y-y)<28);
}

function placeTower(x,y){
  const tile=state.tiles.find(t=>Math.hypot(t.x-x,t.y-y)<t.r);
  if(!tile)return toast("Posicione fora da estrada");
  if(towerAt(tile.x,tile.y))return toast("Esse bloco já está ocupado");
  const hero=HEROES[state.selectedHero];
  if(state.battleCoins<hero.cost)return toast("Moedas insuficientes");
  const level=state.upgrades[state.selectedHero]||1;
  state.battleCoins-=hero.cost;
  state.towers.push({
    x:tile.x,y:tile.y,hero:state.selectedHero,
    range:hero.range+level*2,
    rate:Math.max(420,hero.rate-level*18),
    damage:hero.damage*(1+(level-1)*.12),
    cooldown:200,
    charge:0
  });
  updateHUD();
}

function triggerUltimate(t){
  if(t.charge<100)return toast("Ultimate ainda carregando");
  t.charge=0;
  if(t.hero==="spider"){
    let affected=0;
    for(const e of state.enemies){
      const p=state.path[Math.min(state.path.length-1,Math.floor(e.progress))];
      if(Math.hypot(p.x-t.x,p.y-t.y)<=t.range*1.4){
        e.progress=Math.max(0,e.progress-34);
        e.slowUntil=performance.now()+2400;
        affected++;
      }
    }
    toast(affected?"TEIA DE RECUO!":"Nenhum inimigo no alcance");
  }else{
    const maxBlocks=170;
    for(const e of state.enemies){
      const p=state.path[Math.min(state.path.length-1,Math.floor(e.progress))];
      const dx=p.x-t.x,dy=p.y-t.y;
      if(Math.abs(dx)<26 && Math.abs(dy)<maxBlocks)e.hp-=95+(state.upgrades.iron||1)*8;
    }
    state.effects.push({x:t.x,y:t.y,t:500,type:"beam"});
    toast("UNIBEAM!");
  }
}

canvas.addEventListener("pointerdown",(ev)=>{
  if(!state.running||state.paused)return;
  const r=canvas.getBoundingClientRect();
  const x=ev.clientX-r.left,y=ev.clientY-r.top;
  const t=towerAt(x,y);
  if(t){triggerUltimate(t);return;}
  placeTower(x,y);
});

$$(".hero-card").forEach(btn=>btn.onclick=()=>{
  $$(".hero-card").forEach(b=>b.classList.remove("selected"));
  btn.classList.add("selected");
  state.selectedHero=btn.dataset.hero;
});

function loop(now){
  const dt=Math.min(40,now-(state.lastTime||now));
  state.lastTime=now;
  update(dt,now);
  draw();
  requestAnimationFrame(loop);
}

$("#playBtn").onclick=async()=>{
  try{
    if(document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
  }catch{}
  startGame();
};
$("#heroesBtn").onclick=()=>show("heroes");
$$("[data-back]").forEach(b=>b.onclick=()=>show("home"));
$("#exchangeBtn").onclick=()=>{
  if(state.coins<1000)return toast("Você precisa de 1000 moedas");
  state.coins-=1000;state.diamonds++;save();renderShop();
};
$("#pauseBtn").onclick=()=>{state.paused=true;$("#pauseOverlay").classList.add("active")};
$("#resumeBtn").onclick=()=>{state.paused=false;state.lastTime=performance.now();$("#pauseOverlay").classList.remove("active")};
$("#quitBtn").onclick=()=>{state.running=false;state.paused=false;$("#pauseOverlay").classList.remove("active");show("home")};
$("#nextStageBtn").onclick=()=>startGame();
$("#resultHomeBtn").onclick=()=>show("home");

window.addEventListener("resize",()=>{if(screens.game.classList.contains("active"))resizeCanvas()});
document.addEventListener("visibilitychange",()=>{if(document.hidden&&state.running){state.paused=true;$("#pauseOverlay").classList.add("active")}});

load();
updateHome();
requestAnimationFrame(loop);
