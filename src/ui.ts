import {t} from './i18n';
const icons:Record<string,string>={box:'▣',ball:'●',plank:'▬',ramp:'◩',platform:'▰',wheel:'◉',human:'♟',bomb:'✹'};
export function createUI(){
 document.querySelector('#app')!.innerHTML=`
 <main class="playground" aria-label="Physics playground">
  <div id="game"></div>
  <div class="hud">
   <div class="top-bar">
    <div class="brand glass" data-hud><span class="brand-icon" aria-hidden="true">✳</span><div><b>Pocket<span class="light">Physics</span></b><span id="mode-label" data-dynamic>Physics is playing</span></div></div>
    <div class="top-actions">
     <button id="toggle-toys" class="glass action" data-hud aria-expanded="false" aria-controls="toy-panel"><span aria-hidden="true">▣</span><span>Toys</span></button>
     <button id="toggle-settings" class="glass action" data-hud aria-expanded="false" aria-controls="settings-panel"><span aria-hidden="true">⚙</span><span class="action-text">Settings</span></button>
     <button id="toggle-hud" class="glass icon-button" data-dynamic aria-label="Hide controls" aria-pressed="false">⛶</button>
    </div>
   </div>
   <section id="toy-panel" class="panel glass" data-hud aria-labelledby="toy-heading" hidden>
    <div class="panel-heading"><h2 id="toy-heading">TOY BOX</h2><button id="close-toys" class="icon-button" aria-label="Close toy box">×</button></div>
    <div class="toys">${Object.entries(icons).map(([kind,icon])=>`<button class="toy ${kind}" data-kind="${kind}"><span aria-hidden="true">${icon}</span><b>${kind==='bomb'?'Confetti bomb':kind[0].toUpperCase()+kind.slice(1)}</b></button>`).join('')}</div>
   </section>
   <section id="settings-panel" class="panel glass" data-hud aria-labelledby="settings-heading" hidden>
    <div class="panel-heading"><h2 id="settings-heading">Settings</h2><button id="close-settings" class="icon-button" aria-label="Close settings">×</button></div>
    <label class="setting-row" for="language"><span>Language</span><select id="language"><option value="en">English</option><option value="de">Deutsch</option></select></label>
    <label class="setting-row" for="gravity"><span>Gravity</span><select id="gravity"><option value="1">Earth</option><option value="0.17">Moon</option><option value="0">Float</option><option value="2">Jupiter</option></select></label>
    <button id="help" class="setting-action"><span aria-hidden="true">?</span><span>How to play</span></button>
    <button id="reset" class="setting-action"><span aria-hidden="true">↶</span><span>Reset playground</span></button>
    <div class="save-status"><span class="tiny-dot"></span><span id="storage" data-dynamic>Saved on this device</span></div>
   </section>
   <nav class="tools glass" data-hud aria-label="Object tools">
    <button id="select" class="icon-button selected" aria-label="Select and move">↖</button>
    <button id="pan" class="icon-button" aria-label="Pan the world">✥</button>
    <span class="divider"></span>
    <button id="rotate" class="icon-button" aria-label="Rotate selected object">↻</button>
    <button id="delete" class="icon-button" aria-label="Delete selected object">⌫</button>
   </nav>
   <div class="play-controls glass" data-hud>
    <button id="play" data-dynamic class="play" aria-label="Pause">Ⅱ <span>Pause</span></button>
    <button id="slow" class="secondary" aria-label="Slow-mo" aria-pressed="false">◷ <span>Slow-mo</span></button>
   </div>
   <nav class="zoom glass" data-hud aria-label="Zoom controls">
    <button id="minus" class="icon-button" aria-label="Zoom out">−</button><span id="zoom-value" data-dynamic>100%</span><button id="plus" class="icon-button" aria-label="Zoom in">+</button><button id="home" class="icon-button" aria-label="Center view">⌖</button>
   </nav>
   <div class="object-count" data-hud><span id="count" data-dynamic>0</span> / 150 toys</div>
   <div class="hint" id="hint" data-dynamic data-hud>Tap a toy button to add it. Drag toys to explore.</div>
  </div>
 </main>
 <dialog id="help-dialog" aria-labelledby="help-heading"><button id="close-help" class="icon-button" aria-label="Close help">×</button><h2 id="help-heading">Hello, little inventor! ✳</h2><p>Open Toys to add something. Open Settings for gravity, language and help.</p><p>Use the hide-controls button for an unobstructed view. Tap it again to bring the controls back.</p><p>Tap a toy button to add it. Then drag the toy to move it.</p><p>Drag toys to move them. Use two fingers to pan and pinch to zoom. On a computer, use the pan tool and mouse wheel.</p><p>Hold a confetti bomb still for more than 3 seconds to pop it. Lift your finger to cancel.</p><p>Tap a toy to select it. Use ↻ to turn it, or ⌫ to remove it. Pause for precise placement.</p></dialog>
 <div id="toast" role="status"></div>`;
}
export function closePanels(){
 for(const name of ['toys','settings']){
  document.getElementById(name==='toys'?'toy-panel':'settings-panel')!.hidden=true;
  document.getElementById(`toggle-${name}`)!.setAttribute('aria-expanded','false');
 }
}
export function refreshOverlayLabels(){
 const hidden=document.querySelector('.hud')!.classList.contains('hud-hidden');
 const button=document.getElementById('toggle-hud')!;
 button.setAttribute('aria-label',t(hidden?'Show controls':'Hide controls'));
 button.setAttribute('aria-pressed',String(hidden));
 button.textContent=hidden?'▦':'⛶';
}
export function bindOverlayControls(){
 for(const name of ['toys','settings']){
  const button=document.getElementById(`toggle-${name}`)!;
  const panel=document.getElementById(name==='toys'?'toy-panel':'settings-panel')!;
  button.onclick=()=>{const open=panel.hidden;closePanels();panel.hidden=!open;button.setAttribute('aria-expanded',String(open));};
  document.getElementById(`close-${name}`)!.onclick=()=>{closePanels();button.focus({preventScroll:true});};
 }
 document.getElementById('toggle-hud')!.onclick=()=>{closePanels();document.querySelector('.hud')!.classList.toggle('hud-hidden');refreshOverlayLabels();};
 const game=document.getElementById('game')!;
 game.addEventListener('pointerdown',closePanels);
 game.addEventListener('touchstart',closePanels,{passive:true,capture:true});
 document.addEventListener('keydown',event=>{if(event.key==='Escape')closePanels();});
}
