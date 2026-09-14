"use strict";

const SIZE = 8;
const SAVE_KEY = "blockforge-v04-profile";

const BASE_SHAPES = [
  {id:"single",cells:[[0,0]],tier:1},
  {id:"duo-h",cells:[[0,0],[1,0]],tier:1},
  {id:"duo-v",cells:[[0,0],[0,1]],tier:1},
  {id:"tri-h",cells:[[0,0],[1,0],[2,0]],tier:1},
  {id:"tri-v",cells:[[0,0],[0,1],[0,2]],tier:1},
  {id:"corner-3",cells:[[0,0],[0,1],[1,1]],tier:1},
  {id:"square-4",cells:[[0,0],[1,0],[0,1],[1,1]],tier:2},
  {id:"line-4h",cells:[[0,0],[1,0],[2,0],[3,0]],tier:2},
  {id:"line-4v",cells:[[0,0],[0,1],[0,2],[0,3]],tier:2},
  {id:"l-4",cells:[[0,0],[0,1],[0,2],[1,2]],tier:2},
  {id:"j-4",cells:[[1,0],[1,1],[1,2],[0,2]],tier:2},
  {id:"t-4",cells:[[0,0],[1,0],[2,0],[1,1]],tier:2},
  {id:"zig-4",cells:[[0,0],[1,0],[1,1],[2,1]],tier:2},
  {id:"line-5h",cells:[[0,0],[1,0],[2,0],[3,0],[4,0]],tier:3},
  {id:"line-5v",cells:[[0,0],[0,1],[0,2],[0,3],[0,4]],tier:3}
];

const PACK_SHAPES = {
  extended:[
    {id:"plus-5",cells:[[1,0],[0,1],[1,1],[2,1],[1,2]],tier:3},
    {id:"u-5",cells:[[0,0],[2,0],[0,1],[1,1],[2,1]],tier:3},
    {id:"p-5",cells:[[0,0],[1,0],[0,1],[1,1],[0,2]],tier:3},
    {id:"corner-5",cells:[[0,0],[0,1],[0,2],[1,2],[2,2]],tier:3},
    {id:"step-5",cells:[[0,0],[0,1],[1,1],[1,2],[2,2]],tier:3}
  ],
  wild:[
    {id:"square-9",cells:[[0,0],[1,0],[2,0],[0,1],[1,1],[2,1],[0,2],[1,2],[2,2]],tier:4},
    {id:"hook-6",cells:[[0,0],[0,1],[0,2],[0,3],[1,3],[2,3]],tier:4},
    {id:"cross-8",cells:[[1,0],[0,1],[1,1],[2,1],[0,2],[1,2],[2,2],[1,3]],tier:4},
    {id:"stairs-6",cells:[[0,0],[0,1],[1,1],[1,2],[2,2],[2,3]],tier:4}
  ]
};

const SHOP = {
  skins:[
    {id:"forge",name:"Forge",desc:"Polished metal blocks.",price:0,preview:["#6ed9ff","#3478ff"]},
    {id:"crystal",name:"Crystal",desc:"Cut crystal edges and glow.",price:55,preview:["#dffbff","#6d66ff"]},
    {id:"candy",name:"Candy",desc:"Soft, rounded arcade blocks.",price:80,preview:["#ff9edc","#8b5dff"]}
  ],
  palettes:[
    {id:"ocean",name:"Ocean",desc:"Cool blue forge energy.",price:0,preview:["#6ed9ff","#3478ff"]},
    {id:"sunset",name:"Sunset",desc:"Warm coral and amber.",price:65,preview:["#ffcf68","#ff557e"]},
    {id:"neon",name:"Neon",desc:"Electric lime and violet.",price:105,preview:["#b7ff42","#9747ff"]}
  ],
  themes:[
    {id:"midnight",name:"Midnight",desc:"The original deep-space forge.",price:0,preview:["#12243b","#050b14"]},
    {id:"forest",name:"Forest",desc:"Calm emerald workshop.",price:90,preview:["#174c3d","#04100e"]},
    {id:"aurora",name:"Aurora",desc:"Violet sky and blue haze.",price:135,preview:["#3c3971","#100a1c"]}
  ],
  packs:[
    {id:"extended",name:"Extended Set",desc:"5 new tactical shapes.",price:75,preview:["#52e6c1","#2a78ff"]},
    {id:"wild",name:"Wild Set",desc:"4 large high-risk shapes.",price:125,preview:["#ffd85d","#ff4f87"]}
  ]
};

const PALETTES = {
  ocean:{one:"#6ed9ff",two:"#3478ff",glow:"rgba(62,170,255,.52)"},
  sunset:{one:"#ffd56c",two:"#ff557e",glow:"rgba(255,102,111,.5)"},
  neon:{one:"#c5ff4a",two:"#8b46ff",glow:"rgba(176,91,255,.5)"}
};

const defaults = {
  coins:0,best:0,musicOn:true,musicVolume:.32,sfxVolume:.72,
  owned:{skins:["forge"],palettes:["ocean"],themes:["midnight"],packs:[]},
  selected:{skin:"forge",palette:"ocean",theme:"midnight"}
};

function loadProfile(){
  try{
    const stored = JSON.parse(localStorage.getItem(SAVE_KEY) || "{}");
    return {
      ...defaults,...stored,
      owned:{
        skins:[...new Set([...(defaults.owned.skins),...(stored.owned?.skins||[])])],
        palettes:[...new Set([...(defaults.owned.palettes),...(stored.owned?.palettes||[])])],
        themes:[...new Set([...(defaults.owned.themes),...(stored.owned?.themes||[])])],
        packs:[...new Set(stored.owned?.packs||[])]
      },
      selected:{...defaults.selected,...(stored.selected||{})}
    };
  }catch{return structuredClone(defaults)}
}

let profile = loadProfile();
let grid = Array(SIZE * SIZE).fill(false);
let tray = [];
let score = 0;
let combo = 0;
let busy = false;
let gameOver = false;
let activeDrag = null;
let previewIndexes = [];
let toastTimer = null;
let dragFrame = null;
let pendingDragPoint = null;

const $ = selector => document.querySelector(selector);
const boardEl = $("#board");
const trayEl = $("#tray");
const fxLayer = $("#fxLayer");
const scoreEl = $("#score");
const comboEl = $("#combo");
const bestEl = $("#best");
const coinEl = $("#coinCount");
const shopCoinEl = $("#shopCoinCount");
const statusEl = $("#statusText");
const gameOverModal = $("#gameOverModal");
const shopModal = $("#shopModal");
const shopGrid = $("#shopGrid");
const shopTemplate = $("#shopItemTemplate");
const cells = [];

function saveProfile(){
  localStorage.setItem(SAVE_KEY,JSON.stringify(profile));
}

function applyCosmetics(){
  const palette = PALETTES[profile.selected.palette] || PALETTES.ocean;
  document.body.dataset.theme = profile.selected.theme;
  document.body.dataset.skin = profile.selected.skin;
  document.documentElement.style.setProperty("--block1",palette.one);
  document.documentElement.style.setProperty("--block2",palette.two);
  document.documentElement.style.setProperty("--blockGlow",palette.glow);
}

function updateHud(){
  scoreEl.textContent = score.toLocaleString();
  comboEl.textContent = "×" + combo;
  bestEl.textContent = profile.best.toLocaleString();
  coinEl.textContent = profile.coins;
  shopCoinEl.textContent = profile.coins;
}

function makeBoard(){
  boardEl.innerHTML = "";
  cells.length = 0;
  for(let i=0;i<SIZE*SIZE;i++){
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.setAttribute("role","gridcell");
    cell.dataset.index = i;
    boardEl.appendChild(cell);
    cells.push(cell);
  }
}

function renderBoard(){
  cells.forEach((cell,i)=>{
    cell.className = "cell" + (grid[i] ? " filled" : "");
  });
  previewIndexes = [];
}

function dimensions(shape){
  return {
    width:Math.max(...shape.cells.map(c=>c[0]))+1,
    height:Math.max(...shape.cells.map(c=>c[1]))+1
  };
}

function allShapes(){
  const shapes = [...BASE_SHAPES];
  profile.owned.packs.forEach(pack=>{
    if(PACK_SHAPES[pack]) shapes.push(...PACK_SHAPES[pack]);
  });
  return shapes;
}

function canPlace(shape,row,col){
  return shape.cells.every(([x,y])=>{
    const r=row+y,c=col+x;
    return r>=0 && r<SIZE && c>=0 && c<SIZE && !grid[r*SIZE+c];
  });
}

function canFit(shape){
  const {width,height}=dimensions(shape);
  for(let row=0;row<=SIZE-height;row++){
    for(let col=0;col<=SIZE-width;col++){
      if(canPlace(shape,row,col)) return true;
    }
  }
  return false;
}

function weightedShape(candidates,fullness){
  let wantedTier;
  const roll=Math.random();
  if(fullness>.68) wantedTier=roll<.68?1:(roll<.93?2:3);
  else if(fullness>.42) wantedTier=roll<.38?1:(roll<.82?2:3);
  else wantedTier=roll<.18?1:(roll<.67?2:(roll<.94?3:4));
  const preferred=candidates.filter(s=>s.tier===wantedTier);
  const pool=preferred.length?preferred:candidates;
  return pool[Math.floor(Math.random()*pool.length)];
}

function generateTray(){
  const shapes=allShapes();
  const fullness=grid.filter(Boolean).length/(SIZE*SIZE);
  const fitting=shapes.filter(canFit);
  if(!fitting.length){endGame();return}
  const picked=[];
  for(let i=0;i<3;i++){
    let pool=shapes.filter(s=>!picked.some(p=>p.id===s.id));
    if(!pool.length) pool=shapes;
    if(i===0 || fullness>.58){
      const safe=pool.filter(canFit);
      if(safe.length) pool=safe;
    }
    picked.push(weightedShape(pool,fullness));
  }
  tray=picked.map((shape,index)=>({uid:Date.now()+"-"+index+"-"+Math.random(),shape,used:false}));
  renderTray(true);
  if(audioContext) setTimeout(()=>playSfx("refill"),70);
  statusEl.textContent="Drag a block onto the board";
}

function shapeElement(shape){
  const {width,height}=dimensions(shape);
  const block=document.createElement("div");
  block.className="tray-block";
  block.style.setProperty("--shape-w",width);
  block.style.setProperty("--shape-h",height);
  const mini=document.createElement("div");
  mini.className="mini-grid";
  mini.style.gridTemplateColumns=`repeat(${width},20px)`;
  mini.style.gridTemplateRows=`repeat(${height},20px)`;
  for(let y=0;y<height;y++){
    for(let x=0;x<width;x++){
      const unit=document.createElement("span");
      if(shape.cells.some(c=>c[0]===x&&c[1]===y)) unit.className="mini-cell";
      mini.appendChild(unit);
    }
  }
  block.appendChild(mini);
  return block;
}

function renderTray(fresh=false){
  trayEl.innerHTML="";
  tray.forEach((entry,index)=>{
    const slot=document.createElement("div");
    slot.className="tray-slot"+(entry.used?" used":"")+(fresh?" entering":"");
    if(fresh) slot.style.setProperty("--enter-delay",(index*85)+"ms");
    if(!entry.used){
      const block=shapeElement(entry.shape);
      block.dataset.uid=entry.uid;
      block.addEventListener("pointerdown",event=>beginDrag(event,entry,block));
      slot.appendChild(block);
    }
    trayEl.appendChild(slot);
  });
}

function beginDrag(event,entry,source){
  if(busy||gameOver||entry.used) return;
  event.preventDefault();
  unlockAudio();
  playSfx("pickup");
  if(navigator.vibrate) navigator.vibrate(9);
  const ghost=createGhost(entry.shape);
  const grab=findGrabbedCell(event,source,entry.shape);
  document.body.appendChild(ghost);
  source.classList.add("picked");
  activeDrag={
    entry,source,ghost,pointerId:event.pointerId,pointerType:event.pointerType,
    grabX:grab[0],grabY:grab[1],row:-99,col:-99,valid:false,
    metrics:getBoardMetrics(),lastPreviewKey:""
  };
  document.addEventListener("pointermove",moveDrag,{passive:false});
  document.addEventListener("pointerup",endDrag,{once:true});
  document.addEventListener("pointercancel",endDrag,{once:true});
  moveDrag(event);
}

function createGhost(shape){
  const {width,height}=dimensions(shape);
  const ghost=document.createElement("div");
  ghost.className="drag-ghost";
  ghost.style.gridTemplateColumns=`repeat(${width},var(--ghost-size))`;
  ghost.style.gridTemplateRows=`repeat(${height},var(--ghost-size))`;
  shape.cells.forEach(([x,y])=>{
    const unit=document.createElement("span");
    unit.className="ghost-cell";
    unit.style.gridColumn=x+1;
    unit.style.gridRow=y+1;
    ghost.appendChild(unit);
  });
  return ghost;
}

function findGrabbedCell(event,source,shape){
  const mini=source.querySelector(".mini-grid");
  const rect=mini.getBoundingClientRect();
  const {width,height}=dimensions(shape);
  const rawX=Math.max(0,Math.min(width-1,Math.floor((event.clientX-rect.left)/Math.max(1,rect.width)*width)));
  const rawY=Math.max(0,Math.min(height-1,Math.floor((event.clientY-rect.top)/Math.max(1,rect.height)*height)));
  return shape.cells.reduce((nearest,cell)=>{
    const distance=(cell[0]-rawX)**2+(cell[1]-rawY)**2;
    const nearestDistance=(nearest[0]-rawX)**2+(nearest[1]-rawY)**2;
    return distance<nearestDistance?cell:nearest;
  },shape.cells[0]);
}

function getBoardMetrics(){
  const first=cells[0].getBoundingClientRect();
  const second=cells[1].getBoundingClientRect();
  const board=boardEl.getBoundingClientRect();
  const step=second.left-first.left;
  return {
    firstLeft:first.left,firstTop:first.top,cellSize:first.width,
    step,gap:Math.max(0,step-first.width),
    boardLeft:board.left,boardRight:board.right,
    boardTop:board.top,boardBottom:board.bottom
  };
}

function pointerBoardPosition(point,grabX,grabY,metrics){
  const lift=point.pointerType==="touch"?72:0;
  const pointerX=point.clientX;
  const pointerY=point.clientY-lift;
  const pointerCol=Math.round((pointerX-metrics.firstLeft-metrics.cellSize/2)/metrics.step);
  const pointerRow=Math.round((pointerY-metrics.firstTop-metrics.cellSize/2)/metrics.step);
  const col=pointerCol-grabX;
  const row=pointerRow-grabY;
  const nearBoard=
    pointerX>=metrics.boardLeft-metrics.cellSize &&
    pointerX<=metrics.boardRight+metrics.cellSize &&
    pointerY>=metrics.boardTop-metrics.cellSize &&
    pointerY<=metrics.boardBottom+metrics.cellSize;
  const ghostLeft=nearBoard
    ? metrics.firstLeft+col*metrics.step
    : pointerX-grabX*metrics.step-metrics.cellSize/2;
  const ghostTop=nearBoard
    ? metrics.firstTop+row*metrics.step
    : pointerY-grabY*metrics.step-metrics.cellSize/2;
  return {row,col,ghostLeft,ghostTop,cellSize:metrics.cellSize,gap:metrics.gap};
}

function applyDragPosition(point){
  if(!activeDrag||point.pointerId!==activeDrag.pointerId) return;
  const pos=pointerBoardPosition(
    point,activeDrag.grabX,activeDrag.grabY,activeDrag.metrics
  );
  const valid=canPlace(activeDrag.entry.shape,pos.row,pos.col);
  activeDrag.row=pos.row;
  activeDrag.col=pos.col;
  activeDrag.valid=valid;
  activeDrag.ghost.style.transform=`translate3d(${pos.ghostLeft}px,${pos.ghostTop}px,0)`;
  activeDrag.ghost.style.setProperty("--ghost-size",Math.max(25,pos.cellSize)+"px");
  activeDrag.ghost.style.setProperty("--ghost-gap",pos.gap+"px");
  activeDrag.ghost.classList.toggle("invalid",!valid);
  const previewKey=pos.row+":"+pos.col+":"+valid;
  if(previewKey!==activeDrag.lastPreviewKey){
    activeDrag.lastPreviewKey=previewKey;
    showPreview(activeDrag.entry.shape,pos.row,pos.col,valid);
  }
}

function flushDragFrame(){
  dragFrame=null;
  if(!pendingDragPoint) return;
  const point=pendingDragPoint;
  pendingDragPoint=null;
  applyDragPosition(point);
}

function moveDrag(event){
  if(!activeDrag||event.pointerId!==activeDrag.pointerId) return;
  event.preventDefault();
  pendingDragPoint={
    clientX:event.clientX,clientY:event.clientY,
    pointerId:event.pointerId,pointerType:event.pointerType
  };
  if(dragFrame===null) dragFrame=requestAnimationFrame(flushDragFrame);
}

function showPreview(shape,row,col,valid){
  clearPreview();
  shape.cells.forEach(([x,y])=>{
    const r=row+y,c=col+x;
    if(r>=0&&r<SIZE&&c>=0&&c<SIZE){
      const index=r*SIZE+c;
      cells[index].classList.add(valid?"preview-valid":"preview-invalid");
      previewIndexes.push(index);
    }
  });
}

function clearPreview(){
  previewIndexes.forEach(i=>cells[i]?.classList.remove("preview-valid","preview-invalid"));
  previewIndexes=[];
}

function endDrag(event){
  if(!activeDrag) return;
  if(event.pointerId===activeDrag.pointerId){
    if(dragFrame!==null){
      cancelAnimationFrame(dragFrame);
      dragFrame=null;
    }
    pendingDragPoint=null;
    applyDragPosition({
      clientX:event.clientX,clientY:event.clientY,
      pointerId:event.pointerId,pointerType:event.pointerType
    });
  }
  const drag=activeDrag;
  activeDrag=null;
  document.removeEventListener("pointermove",moveDrag);
  clearPreview();
  drag.source.classList.remove("picked");
  drag.ghost.remove();
  if(event.pointerId!==drag.pointerId) return;
  if(drag.valid){
    placeShape(drag.entry,drag.row,drag.col);
  }else{
    playSfx("error");
    drag.source.animate(
      [{transform:"translateX(0)"},{transform:"translateX(-7px)"},{transform:"translateX(7px)"},{transform:"translateX(0)"}],
      {duration:240,easing:"ease-out"}
    );
  }
}

function placeShape(entry,row,col){
  const placed=[];
  entry.shape.cells.forEach(([x,y])=>{
    const index=(row+y)*SIZE+(col+x);
    grid[index]=true;
    placed.push(index);
  });
  entry.used=true;
  score+=entry.shape.cells.length*10;
  profile.best=Math.max(profile.best,score);
  saveProfile();
  renderBoard();
  placed.forEach((index,i)=>{
    setTimeout(()=>cells[index]?.classList.add("placed"),i*25);
  });
  renderTray();
  playSfx("drop");
  if(navigator.vibrate) navigator.vibrate(16);
  updateHud();

  const lines=findCompleteLines();
  if(lines.length){
    clearLines(lines);
  }else{
    combo=0;
    updateHud();
    afterTurn();
  }
}

function findCompleteLines(){
  const lines=[];
  for(let r=0;r<SIZE;r++){
    const indexes=Array.from({length:SIZE},(_,c)=>r*SIZE+c);
    if(indexes.every(i=>grid[i])) lines.push(indexes);
  }
  for(let c=0;c<SIZE;c++){
    const indexes=Array.from({length:SIZE},(_,r)=>r*SIZE+c);
    if(indexes.every(i=>grid[i])) lines.push(indexes);
  }
  return lines;
}

function clearLines(lines){
  busy=true;
  combo++;
  const unique=[...new Set(lines.flat())];
  const lineCount=lines.length;
  const earned=lineCount*4+Math.max(0,lineCount-1)*3+Math.max(0,combo-1)*2;
  const bonus=lineCount*180+Math.max(0,lineCount-1)*120+combo*35;
  statusEl.textContent=lineCount>1?`${lineCount} LINES • COMBO ×${combo}`:`LINE CLEAR • COMBO ×${combo}`;
  document.querySelector(".board-wrap").classList.remove("combo-clear");
  void document.querySelector(".board-wrap").offsetWidth;
  document.querySelector(".board-wrap").classList.add("combo-clear");
  unique.forEach((index,i)=>{
    setTimeout(()=>{
      cells[index]?.classList.add("clearing");
      burstAt(index,i%2===0?10:6);
    },Math.min(i*13,150));
  });
  playSfx("clear",lineCount);
  if(navigator.vibrate) navigator.vibrate([20,25,32]);
  setTimeout(()=>{
    unique.forEach(i=>grid[i]=false);
    score+=bonus;
    profile.coins+=earned;
    profile.best=Math.max(profile.best,score);
    saveProfile();
    renderBoard();
    scorePop("+"+bonus+"  •  +"+earned+" COINS");
    showToast("+"+earned+" coins forged");
    updateHud();
    busy=false;
    afterTurn();
  },520);
}

function burstAt(index,count){
  const cell=cells[index];
  if(!cell) return;
  const boardRect=boardEl.getBoundingClientRect();
  const rect=cell.getBoundingClientRect();
  const x=rect.left-boardRect.left+rect.width/2;
  const y=rect.top-boardRect.top+rect.height/2;
  for(let i=0;i<count;i++){
    const p=document.createElement("i");
    p.className="particle";
    const angle=Math.random()*Math.PI*2;
    const distance=24+Math.random()*55;
    p.style.left=x+"px";
    p.style.top=y+"px";
    p.style.setProperty("--dx",Math.cos(angle)*distance+"px");
    p.style.setProperty("--dy",Math.sin(angle)*distance+"px");
    p.style.setProperty("--spin",(Math.random()*540-270)+"deg");
    p.style.setProperty("--particle",i%3===0?"var(--gold)":"var(--accent)");
    fxLayer.appendChild(p);
    p.addEventListener("animationend",()=>p.remove());
  }
}

function scorePop(text){
  const pop=document.createElement("b");
  pop.className="score-pop";
  pop.textContent=text;
  pop.style.left="50%";
  pop.style.top="46%";
  pop.style.transform="translateX(-50%)";
  fxLayer.appendChild(pop);
  pop.addEventListener("animationend",()=>pop.remove());
}

function afterTurn(){
  if(tray.every(entry=>entry.used)){
    generateTray();
    if(gameOver) return;
  }
  setTimeout(checkGameOver,40);
}

function checkGameOver(){
  if(busy||gameOver) return;
  const remaining=tray.filter(entry=>!entry.used);
  if(remaining.length && !remaining.some(entry=>canFit(entry.shape))) endGame();
}

function endGame(){
  gameOver=true;
  activeDrag?.ghost?.remove();
  activeDrag=null;
  $("#finalScore").textContent=score.toLocaleString();
  $("#newBestText").textContent=score>=profile.best&&score>0?"NEW BEST SCORE!":"Earn coins and unlock a new style.";
  gameOverModal.classList.add("open");
  gameOverModal.setAttribute("aria-hidden","false");
  playSfx("gameover");
  saveProfile();
}

function restartGame(){
  unlockAudio();
  grid=Array(SIZE*SIZE).fill(false);
  tray=[];
  score=0;
  combo=0;
  busy=false;
  gameOver=false;
  clearPreview();
  gameOverModal.classList.remove("open");
  gameOverModal.setAttribute("aria-hidden","true");
  renderBoard();
  updateHud();
  generateTray();
  showToast("New forge started");
  playSfx("restart");
}

function showToast(message){
  const toast=$("#toast");
  toast.textContent=message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>toast.classList.remove("show"),1450);
}

/* Audio: tonal oscillators only; no noise buffer, so there is no constant hiss. */
let audioContext=null;
let musicGain=null;
let sfxGain=null;
let musicTimer=null;
let musicStep=0;

function unlockAudio(){
  if(!audioContext){
    audioContext=new (window.AudioContext||window.webkitAudioContext)();
    musicGain=audioContext.createGain();
    sfxGain=audioContext.createGain();
    musicGain.connect(audioContext.destination);
    sfxGain.connect(audioContext.destination);
    updateAudioLevels();
    startMusicLoop();
  }
  if(audioContext.state==="suspended") audioContext.resume();
}

function updateAudioLevels(){
  if(!musicGain||!sfxGain) return;
  musicGain.gain.setTargetAtTime(profile.musicOn?profile.musicVolume:0,audioContext.currentTime,.06);
  sfxGain.gain.setTargetAtTime(profile.sfxVolume,audioContext.currentTime,.03);
  $("#musicBtn").classList.toggle("muted",!profile.musicOn);
  $("#musicBtn").textContent=profile.musicOn?"♫":"♪";
}

function tone(frequency,start,duration,volume,type,target,slideTo){
  if(!audioContext||!target||volume<=0) return;
  const osc=audioContext.createOscillator();
  const gain=audioContext.createGain();
  const filter=audioContext.createBiquadFilter();
  osc.type=type||"sine";
  osc.frequency.setValueAtTime(frequency,start);
  if(slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo,start+duration);
  filter.type="lowpass";
  filter.frequency.value=type==="square"?900:1800;
  gain.gain.setValueAtTime(.0001,start);
  gain.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),start+.025);
  gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
  osc.connect(filter);filter.connect(gain);gain.connect(target);
  osc.start(start);osc.stop(start+duration+.04);
}

function scheduleMusic(){
  if(!audioContext||!musicGain) return;
  const chords=[
    [130.81,164.81,196.00],
    [110.00,146.83,174.61],
    [98.00,130.81,164.81],
    [116.54,146.83,196.00]
  ];
  const chord=chords[musicStep++%chords.length];
  const now=audioContext.currentTime+.08;
  chord.forEach((frequency,i)=>{
    tone(frequency,now+i*.07,3.35,.018,"sine",musicGain);
    tone(frequency*2,now+.55+i*.31,1.6,.006,"triangle",musicGain);
  });
  [0,2,1,2].forEach((note,i)=>{
    tone(chord[note]*2,now+.35+i*.72,.72,.009,"sine",musicGain);
  });
}

function startMusicLoop(){
  if(musicTimer) clearInterval(musicTimer);
  scheduleMusic();
  musicTimer=setInterval(scheduleMusic,3300);
}

function playSfx(kind,power=1){
  if(!audioContext||!sfxGain||profile.sfxVolume<=0) return;
  const now=audioContext.currentTime;
  if(kind==="pickup"){
    tone(260,now,.09,.07,"sine",sfxGain,390);
    tone(520,now+.035,.07,.025,"triangle",sfxGain);
  }else if(kind==="drop"){
    tone(145,now,.12,.13,"sine",sfxGain,72);
    tone(620,now,.045,.03,"square",sfxGain,360);
  }else if(kind==="error"){
    tone(150,now,.12,.055,"square",sfxGain,105);
  }else if(kind==="clear"){
    [392,523.25,659.25,783.99].slice(0,Math.min(4,power+2)).forEach((f,i)=>tone(f,now+i*.07,.3,.055,"triangle",sfxGain));
    tone(95,now,.22,.1,"sine",sfxGain,48);
  }else if(kind==="gameover"){
    [220,174.61,130.81].forEach((f,i)=>tone(f,now+i*.22,.5,.045,"sine",sfxGain));
  }else if(kind==="buy"){
    [523.25,659.25,783.99].forEach((f,i)=>tone(f,now+i*.08,.26,.045,"triangle",sfxGain));
  }else if(kind==="refill"){
    [330,440,554.37].forEach((f,i)=>tone(f,now+i*.075,.18,.025,"sine",sfxGain));
  }else if(kind==="restart"){
    tone(180,now,.18,.04,"sine",sfxGain,360);
  }
}

function setupAudioControls(){
  const musicSlider=$("#musicVolume");
  const sfxSlider=$("#sfxVolume");
  musicSlider.value=Math.round(profile.musicVolume*100);
  sfxSlider.value=Math.round(profile.sfxVolume*100);
  $("#musicValue").textContent=musicSlider.value+"%";
  $("#sfxValue").textContent=sfxSlider.value+"%";
  $("#musicBtn").classList.toggle("muted",!profile.musicOn);

  $("#musicBtn").addEventListener("click",()=>{
    unlockAudio();
    profile.musicOn=!profile.musicOn;
    saveProfile();updateAudioLevels();
    showToast(profile.musicOn?"Music on":"Music off");
  });
  musicSlider.addEventListener("input",event=>{
    unlockAudio();
    profile.musicVolume=Number(event.target.value)/100;
    if(profile.musicVolume>0) profile.musicOn=true;
    $("#musicValue").textContent=event.target.value+"%";
    saveProfile();updateAudioLevels();
  });
  sfxSlider.addEventListener("input",event=>{
    unlockAudio();
    profile.sfxVolume=Number(event.target.value)/100;
    $("#sfxValue").textContent=event.target.value+"%";
    saveProfile();updateAudioLevels();
    if(profile.sfxVolume>0) playSfx("pickup");
  });
}

let activeShopTab="skins";

function openShop(tab=activeShopTab){
  unlockAudio();
  activeShopTab=tab;
  shopModal.classList.add("open");
  shopModal.setAttribute("aria-hidden","false");
  renderShop();
}

function closeShop(){
  shopModal.classList.remove("open");
  shopModal.setAttribute("aria-hidden","true");
}

function renderShop(){
  document.querySelectorAll("#shopTabs button").forEach(btn=>btn.classList.toggle("active",btn.dataset.tab===activeShopTab));
  shopGrid.innerHTML="";
  SHOP[activeShopTab].forEach(item=>{
    const node=shopTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector("h3").textContent=item.name;
    node.querySelector("p").textContent=item.desc;
    const preview=node.querySelector(".item-preview");
    preview.style.setProperty("--preview1",item.preview[0]);
    preview.style.setProperty("--preview2",item.preview[1]);
    const button=node.querySelector(".buy-btn");
    const owned=profile.owned[activeShopTab].includes(item.id);
    const selected=activeShopTab!=="packs"&&profile.selected[activeShopTab.slice(0,-1)]===item.id;
    if(selected){
      button.textContent="EQUIPPED";button.className="buy-btn selected";
    }else if(owned){
      button.textContent=activeShopTab==="packs"?"OWNED":"EQUIP";button.className="buy-btn owned";
    }else{
      button.textContent="● "+item.price;
      button.disabled=profile.coins<item.price;
    }
    button.addEventListener("click",()=>shopAction(activeShopTab,item));
    shopGrid.appendChild(node);
  });
  updateHud();
}

function shopAction(category,item){
  unlockAudio();
  const owned=profile.owned[category].includes(item.id);
  if(!owned){
    if(profile.coins<item.price){showToast("Not enough coins");return}
    profile.coins-=item.price;
    profile.owned[category].push(item.id);
    playSfx("buy");
    showToast(item.name+" unlocked");
  }
  if(category!=="packs"){
    profile.selected[category.slice(0,-1)]=item.id;
    applyCosmetics();
  }
  saveProfile();
  updateHud();
  renderShop();
}

function setupShop(){
  $("#shopBtn").addEventListener("click",()=>openShop());
  $("#gameOverShopBtn").addEventListener("click",()=>{gameOverModal.classList.remove("open");openShop()});
  $("#closeShopBtn").addEventListener("click",closeShop);
  $("#shopTabs").addEventListener("click",event=>{
    const button=event.target.closest("button[data-tab]");
    if(!button) return;
    activeShopTab=button.dataset.tab;
    renderShop();
  });
  shopModal.addEventListener("pointerdown",event=>{if(event.target===shopModal) closeShop()});
}

function init(){
  applyCosmetics();
  makeBoard();
  renderBoard();
  updateHud();
  setupAudioControls();
  setupShop();
  generateTray();

  $("#restartBtn").addEventListener("click",restartGame);
  $("#playAgainBtn").addEventListener("click",restartGame);
  document.addEventListener("pointerdown",unlockAudio,{once:true});
  document.addEventListener("keydown",event=>{
    if(event.key==="Escape") closeShop();
    if((event.key==="r"||event.key==="R")&&!shopModal.classList.contains("open")) restartGame();
  });
  window.addEventListener("blur",()=>{
    if(activeDrag){
      activeDrag.ghost.remove();
      activeDrag.source.classList.remove("picked");
      activeDrag=null;
      if(dragFrame!==null) cancelAnimationFrame(dragFrame);
      dragFrame=null;
      pendingDragPoint=null;
      clearPreview();
    }
  });
}

init();
