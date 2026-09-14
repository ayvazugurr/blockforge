import fs from "node:fs";

const read=path=>fs.readFileSync(path,"utf8");
const html=read("index.html");
const css=read("style.css");
const game=read("game.js");
const worker=read("sw.js");
const manifest=JSON.parse(read("manifest.webmanifest"));

new Function(game);
new Function(worker);

const requiredFiles=[
  "index.html","style.css","game.js","sw.js","manifest.webmanifest",
  "icons/icon.svg","icons/icon-maskable.svg"
];
requiredFiles.forEach(path=>{
  if(!fs.existsSync(path)) throw new Error("Missing release file: "+path);
});

const ids=[...game.matchAll(/\$\("#([A-Za-z0-9_-]+)"\)/g)].map(match=>match[1]);
const missingIds=[...new Set(ids.filter(id=>!html.includes(`id="${id}"`)))];
if(missingIds.length) throw new Error("Missing HTML IDs: "+missingIds.join(", "));

if(!html.includes('name="viewport"')) throw new Error("Viewport metadata missing");
if(!html.includes('rel="manifest"')) throw new Error("Manifest link missing");
if(!css.includes("touch-action:none")) throw new Error("Touch-action optimization missing");
if(!css.includes("@media(max-width:430px)")) throw new Error("Compact mobile breakpoint missing");
if(!css.includes("safe-area-inset-top")) throw new Error("Mobile safe-area support missing");
if(manifest.display!=="standalone") throw new Error("Manifest is not standalone");
if(!Array.isArray(manifest.icons)||manifest.icons.length<2) throw new Error("PWA icons missing");

const cached=[...worker.matchAll(/"\.\/([^"]+)"/g)].map(match=>match[1]).filter(Boolean);
["index.html","style.css","game.js","manifest.webmanifest"].forEach(asset=>{
  if(!cached.includes(asset)) throw new Error("Core asset not cached: "+asset);
});

console.log("BlockForge v1.0 release checks passed");
