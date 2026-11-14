import {createUI,bindOverlayControls,closePanels,refreshOverlayLabels} from './ui';
import {t,addHint,captureTranslations,setLanguage,getLanguage} from './i18n';
import Phaser from 'phaser';
import {registerSW} from 'virtual:pwa-register';
import './style.css';
import {Playground} from './scene';
import {load,save,loadLanguage,saveLanguage} from './storage';
createUI();
bindOverlayControls();
const app = document.querySelector<HTMLElement>('#app')!;
captureTranslations(app);
export const scene=new Playground();
let storageUnavailable=false;
function refreshLanguage(){
 setLanguage(getLanguage(),app);
 refreshOverlayLabels();
 document.querySelector<HTMLSelectElement>('#language')!.value=getLanguage();
 document.querySelector('#play')!.setAttribute('aria-label',t(scene.paused?'Play':'Pause'));
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
const gameControls=document.querySelectorAll<HTMLButtonElement|HTMLSelectElement>('[data-kind], .tools button, .zoom button, .play-controls button, #reset, #gravity');
gameControls.forEach(control=>control.disabled=true);
scene.onReady=async()=>{try{const w=await load();if(w)scene.restore(w);}catch{toast(t("Saved playground could not be opened. Storage may be unavailable."));}finally{ready=true;gameControls.forEach(control=>control.disabled=false);}};
setInterval(()=>{if(ready){dirty=true;void checkpoint();}},10000);
document.querySelectorAll<HTMLButtonElement>('[data-kind]').forEach(b=>b.onclick=()=>{if(!ready)return;scene.addToy(b.dataset.kind as import('./world').Kind);closePanels();});
const on=(id:string,fn:()=>void)=>document.getElementById(id)!.onclick=fn;
on('play',()=>{scene.paused=!scene.paused;scene.syncPause();document.querySelector('#play')!.setAttribute('aria-label',t(scene.paused?'Play':'Pause'));
 document.querySelector('#play')!.innerHTML=scene.paused?'▶ <span>'+t('Play')+'</span>':'Ⅱ <span>'+t('Pause')+'</span>';document.querySelector('#mode-label')!.textContent=scene.paused?t("Ready to build"):t("Physics is playing");});
on('slow',()=>{scene.slow=!scene.slow;scene.syncPause();document.querySelector('#slow')!.classList.toggle('enabled',scene.slow);document.querySelector('#slow')!.setAttribute('aria-pressed',String(scene.slow));});
on('select',()=>scene.setTool('select'));on('pan',()=>scene.setTool('pan'));on('rotate',()=>scene.rotate());on('delete',()=>scene.removeSelected());on('plus',()=>scene.zoomBy(1.2));on('minus',()=>scene.zoomBy(1/1.2));on('home',()=>scene.center());
on('reset',()=>{if(confirm(t("Reset your playground to the starter toys?"))){scene.seed();closePanels();changed();}});
document.querySelector<HTMLSelectElement>('#gravity')!.onchange=e=>{scene.matter.world.setGravity(0,Number((e.target as HTMLSelectElement).value));changed();};
on('help',()=>{closePanels();document.querySelector<HTMLDialogElement>('dialog')!.showModal();});on('close-help',()=>document.querySelector<HTMLDialogElement>('dialog')!.close());
document.addEventListener('visibilitychange',()=>{scene.cancelGesture();scene.syncPause();if(document.hidden){dirty=true;void checkpoint();}});
window.addEventListener('pagehide',()=>{dirty=true;void checkpoint();});
registerSW({onOfflineReady(){toast(t("Ready for offline play!"));},onNeedRefresh(){toast(t("An update is ready. Close and reopen when you finish playing."));}});

// Start Phaser only after lifecycle callbacks and UI handlers are attached.
export const game=new Phaser.Game({type:Phaser.AUTO,parent:'game',backgroundColor:'#eff4ec',scale:{mode:Phaser.Scale.RESIZE,width:800,height:600},physics:{default:'matter',matter:{gravity:{x:0,y:1},enableSleeping:true}},scene:[scene],render:{antialias:true},input:{activePointers:3}});
