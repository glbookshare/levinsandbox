import {t,addHint,captureTranslations,setLanguage,getLanguage} from './i18n';
import Phaser from 'phaser';
import {registerSW} from 'virtual:pwa-register';
import './style.css';
import {Playground} from './scene';
import {load,save,loadLanguage,saveLanguage} from './storage';
const icons:Record<string,string>={box:'▣',ball:'●',plank:'▬',ramp:'◩',platform:'▰',wheel:'◉',human:'♟'};
document.querySelector('#app')!.innerHTML=`<header><a class="brand" href="#"><span class="brand-icon">✳</span><span>Pocket<span class="light">Physics</span><small>A LITTLE WORLD OF POSSIBILITIES</small></span></a><div class="world-title"><span class="tiny-dot"></span> My playground <span class="tag">PHASE 01</span></div><select id="language" aria-label="Language"><option value="en">English</option><option value="de">Deutsch</option></select><button id="help" class="round" aria-label="How to play">?</button></header><main><aside><div class="tray-title">TOY BOX <span>7</span></div><p>What will you make?</p><div class="categories"><span class="active">Shapes</span><span>More soon</span></div><div class="toys">${Object.entries(icons).map(([k,v])=>`<button class="toy ${k}" data-kind="${k}"><span>${v}</span><b>${k[0].toUpperCase()+k.slice(1)}</b></button>`).join('')}</div><div class="tray-tip"><span>✦</span><b>Little idea, big possibility.</b><p>Try balancing a ball on a stack of boxes!</p></div><div class="local-note">◈ &nbsp; Made for curious minds</div></aside><section class="workspace"><div class="stage-top"><div><b>My playground</b><span>Go on. Make something wonderful.</span></div><span class="live"><i></i> <span id="mode-label" data-dynamic>Physics is playing</span></span></div><div id="game"><div class="scene-label">THE POSSIBILITIES ARE ENDLESS <span>✦</span></div><div class="tools"><button id="select" class="selected" aria-label="Select and move">↖</button><button id="pan" aria-label="Pan the world">✥</button><span></span><button id="rotate" aria-label="Rotate selected object">↻</button><button id="delete" aria-label="Delete selected object">⌫</button></div><div class="zoom"><button id="minus" aria-label="Zoom out">−</button><span id="zoom-value" data-dynamic>100%</span><button id="plus" aria-label="Zoom in">+</button><button id="home" aria-label="Center view">⌖</button></div><div class="hint" id="hint" data-dynamic>↖ &nbsp; Tap a toy button to add it. Drag toys to explore.</div><div class="object-count"><span id="count" data-dynamic>0</span> / 150 toys</div></div><footer><div class="play-controls"><button id="play" data-dynamic class="play">Ⅱ <span>Pause</span></button><button id="slow" class="secondary">◷ <span>Slow-mo</span></button><button id="reset" class="round" aria-label="Reset playground">↶</button></div><label class="gravity">↓ <span>Gravity</span><select id="gravity" aria-label="Gravity"><option value="1">Earth</option><option value="0.17">Moon</option><option value="0">Float</option><option value="2">Jupiter</option></select></label><div class="save-status"><span class="tiny-dot"></span><span id="storage" data-dynamic>Saved on this device</span></div></footer></section></main><div class="bottom-note"><span>IMAGINE. BUILD. PLAY. REPEAT.</span><span>One finger to move toys &nbsp; · &nbsp; Two fingers to pan & zoom</span><span>All play. No pressure. ♡</span></div><dialog id="help-dialog"><button id="close-help" class="round" aria-label="Close help">×</button><h2>Hello, little inventor! ✳</h2><p>Tap a toy button to add it. Then drag the toy to move it.</p><p>Drag toys to move them. Use two fingers to pan and pinch to zoom. On a computer, use the pan tool and mouse wheel.</p><p>Tap a toy to select it. Use ↻ to turn it, or ⌫ to remove it. Pause for precise placement.</p><p>Your playground stays on this device. This is Phase 1 — more construction tools are coming later.</p></dialog><div id="toast" role="status"></div>`;
const app = document.querySelector<HTMLElement>('#app')!;
captureTranslations(app);
export const scene=new Playground();
let storageUnavailable=false;
function refreshLanguage(){
 setLanguage(getLanguage(),app);
 document.querySelector<HTMLSelectElement>('#language')!.value=getLanguage();
 document.querySelector('#play')!.innerHTML=scene.paused?'▶ <span>'+t('Play')+'</span>':'Ⅱ <span>'+t('Pause')+'</span>';
 document.querySelector('#mode-label')!.textContent=t(scene.paused?'Ready to build':'Physics is playing');
 document.querySelector('#storage')!.textContent=t(storageUnavailable?'Storage unavailable':'Saved on this device');
 document.querySelector('#hint')!.textContent=scene.tool==='pan'?t('Drag the playground to look around'):scene.tool==='select'?t('Tap to select. Drag to move. Pinch to explore.'):addHint(scene.tool);
 document.querySelector('#toast')!.classList.remove('show');
}
refreshLanguage();
let languageChanged=false;
document.querySelector<HTMLSelectElement>('#language')!.onchange=async e=>{
 languageChanged=true;
 const value=(e.target as HTMLSelectElement).value==='de'?'de':'en';
 setLanguage(value,app);refreshLanguage();
 try{await saveLanguage(value);}catch{toast(t('Your language choice could not be saved.'));}
};
void loadLanguage().then(value=>{if(value&&!languageChanged){setLanguage(value,app);refreshLanguage();}}).catch(()=>{});

export function toast(message:string){const t=document.querySelector('#toast')!;t.textContent=message;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),3200);}
let timer:ReturnType<typeof setTimeout>;let ready=false;let dirty=false;
export function changed(){dirty=true;clearTimeout(timer);timer=setTimeout(checkpoint,1000);}
async function checkpoint(){if(!ready||!dirty)return;try{await save(scene.snapshot());dirty=false;storageUnavailable=false;document.querySelector('#storage')!.textContent=t("Saved on this device");}catch{storageUnavailable=true;document.querySelector('#storage')!.textContent=t("Storage unavailable");toast(t("Device storage is unavailable. This playground cannot be saved."));}}
const gameControls=document.querySelectorAll<HTMLButtonElement|HTMLSelectElement>('[data-kind], .tools button, .zoom button, .play-controls button, #gravity');
gameControls.forEach(control=>control.disabled=true);
scene.onReady=async()=>{try{const w=await load();if(w)scene.restore(w);}catch{toast(t("Saved playground could not be opened. Storage may be unavailable."));}finally{ready=true;gameControls.forEach(control=>control.disabled=false);}};
setInterval(()=>{if(ready){dirty=true;void checkpoint();}},10000);
document.querySelectorAll<HTMLButtonElement>('[data-kind]').forEach(b=>b.onclick=()=>{if(!ready)return;scene.addToy(b.dataset.kind as import('./world').Kind);});
const on=(id:string,fn:()=>void)=>document.getElementById(id)!.onclick=fn;
on('play',()=>{scene.paused=!scene.paused;scene.syncPause();document.querySelector('#play')!.innerHTML=scene.paused?'▶ <span>'+t('Play')+'</span>':'Ⅱ <span>'+t('Pause')+'</span>';document.querySelector('#mode-label')!.textContent=scene.paused?t("Ready to build"):t("Physics is playing");});
on('slow',()=>{scene.slow=!scene.slow;scene.syncPause();document.querySelector('#slow')!.classList.toggle('enabled',scene.slow);});
on('select',()=>scene.setTool('select'));on('pan',()=>scene.setTool('pan'));on('rotate',()=>scene.rotate());on('delete',()=>scene.removeSelected());on('plus',()=>scene.zoomBy(1.2));on('minus',()=>scene.zoomBy(1/1.2));on('home',()=>scene.center());
on('reset',()=>{if(confirm(t("Reset your playground to the starter toys?"))){scene.seed();changed();}});
document.querySelector<HTMLSelectElement>('#gravity')!.onchange=e=>{scene.matter.world.setGravity(0,Number((e.target as HTMLSelectElement).value));changed();};
on('help',()=>document.querySelector<HTMLDialogElement>('dialog')!.showModal());on('close-help',()=>document.querySelector<HTMLDialogElement>('dialog')!.close());
document.addEventListener('visibilitychange',()=>{scene.cancelGesture();scene.syncPause();if(document.hidden){dirty=true;void checkpoint();}});
window.addEventListener('pagehide',()=>{dirty=true;void checkpoint();});
registerSW({onOfflineReady(){toast(t("Ready for offline play!"));},onNeedRefresh(){toast(t("An update is ready. Close and reopen when you finish playing."));}});

// Start Phaser only after lifecycle callbacks and UI handlers are attached.
export const game=new Phaser.Game({type:Phaser.AUTO,parent:'game',backgroundColor:'#eff4ec',scale:{mode:Phaser.Scale.RESIZE,width:800,height:600},physics:{default:'matter',matter:{gravity:{x:0,y:1},enableSleeping:true}},scene:[scene],render:{antialias:true},input:{activePointers:3}});
