// @vitest-environment happy-dom
import {it,expect,vi} from 'vitest';
import {createCanvas,Image,type Canvas} from '@napi-rs/canvas';
vi.mock('virtual:pwa-register',()=>({registerSW:vi.fn()}));
vi.mock('./storage',()=>({load:async()=>null,save:async()=>{},loadLanguage:async()=>null,saveLanguage:async()=>{}}));
it('boots real Phaser, adds toys by mouse and handles Safari touch zoom',async()=>{
 const canvases=new WeakMap<HTMLCanvasElement,Canvas>();
 vi.stubGlobal('Image',Image);
 (window as any).CanvasRenderingContext2D=class {};
 vi.stubGlobal('CanvasRenderingContext2D',(window as any).CanvasRenderingContext2D);
 vi.spyOn(HTMLCanvasElement.prototype,'getContext').mockImplementation(function(this:HTMLCanvasElement,type:string){
  if(type!=='2d')return null;
  let backing=canvases.get(this);if(!backing){backing=createCanvas(this.width||1,this.height||1);canvases.set(this,backing);}
  if(backing.width!==this.width)backing.width=this.width||1;if(backing.height!==this.height)backing.height=this.height||1;
  const ctx=backing.getContext('2d');
  if(!(ctx as any).__wrapped){const draw=ctx.drawImage.bind(ctx);ctx.drawImage=((source:any,...args:any[])=>draw(canvases.get(source)??source,...args as [number,number])) as any;(ctx as any).__wrapped=true;}
  return ctx as any;
 } as any);
 vi.spyOn(HTMLElement.prototype,'getBoundingClientRect').mockReturnValue({x:0,y:0,left:0,top:0,width:1000,height:600,right:1000,bottom:600,toJSON(){}});
 document.body.innerHTML='<div id="app"></div>';
 const errors:unknown[]=[];window.addEventListener('error',e=>errors.push(e.error));
 const {scene}=await import('./main');
 try{
  await vi.waitFor(()=>{expect(errors).toEqual([]);expect(scene.sys.isActive()).toBe(true);expect(document.querySelector<HTMLButtonElement>('[data-kind="box"]')!.disabled).toBe(false);},{timeout:5000});
  const canvasHost=document.querySelector('#game')!;
  const hud=document.querySelector('.hud')!;
  expect(canvasHost.parentElement).toBe(hud.parentElement);
  expect(document.querySelector('#settings-panel')!.getAttribute('hidden')).not.toBeNull();
  document.querySelector<HTMLButtonElement>('#toggle-settings')!.click();
  expect(document.querySelector<HTMLElement>('#settings-panel')!.hidden).toBe(false);
  const gravity=document.querySelector<HTMLSelectElement>('#gravity')!;
  gravity.value='0.17';gravity.dispatchEvent(new Event('change'));
  expect(scene.snapshot().gravity).toBe(.17);gravity.value='1';gravity.dispatchEvent(new Event('change'));
  document.querySelector<HTMLButtonElement>('#toggle-toys')!.click();
  expect(document.querySelector<HTMLElement>('#settings-panel')!.hidden).toBe(true);
  expect(document.querySelector<HTMLElement>('#toy-panel')!.hidden).toBe(false);
  document.querySelector<HTMLButtonElement>('#close-toys')!.click();
  const before=scene.objects.length;
  const buttons=Array.from(document.querySelectorAll<HTMLButtonElement>('[data-kind]'));
  expect(buttons).toHaveLength(7);
  buttons.forEach((button,i)=>{
   document.querySelector<HTMLButtonElement>('#toggle-toys')!.click();
   expect(document.querySelector<HTMLElement>('#toy-panel')!.hidden).toBe(false);
   button.click();expect(scene.objects.length).toBe(before+i+1);expect(scene.selected).toBe(scene.objects.at(-1)!.body);
   expect(document.querySelector<HTMLElement>('#toy-panel')!.hidden).toBe(true);
  });
  const visibility=document.querySelector<HTMLButtonElement>('#toggle-hud')!;
  document.querySelector<HTMLButtonElement>('#toggle-settings')!.click();
  const language=document.querySelector<HTMLSelectElement>('#language')!;
  language.value='de';language.dispatchEvent(new Event('change'));
  expect(document.querySelector('#settings-heading')!.textContent).toBe('Einstellungen');
  const objectCount=scene.objects.length,zoomBefore=scene.cameras.main.zoom;
  const cameraSize=[scene.cameras.main.width,scene.cameras.main.height];
  visibility.click();expect(hud.classList.contains('hud-hidden')).toBe(true);expect(visibility.getAttribute('aria-pressed')).toBe('true');
  expect(visibility.getAttribute('aria-label')).toBe('Bedienelemente einblenden');
  visibility.click();expect(hud.classList.contains('hud-hidden')).toBe(false);
  expect([scene.cameras.main.width,scene.cameras.main.height]).toEqual(cameraSize);
  language.value='en';language.dispatchEvent(new Event('change'));
  expect(scene.objects.length).toBe(objectCount);expect(scene.cameras.main.zoom).toBe(zoomBefore);
  expect(scene.humans.size).toBe(1);
  await vi.waitFor(()=>{expect(errors).toEqual([]);expect(scene.game.loop.frame).toBeGreaterThan(4);});

  // iPad/Safari emits native Touch Events; exercise the actual registered DOM listeners.
  scene.paused=true;scene.syncPause();
  const canvas=scene.game.canvas,camera=scene.cameras.main;
  const touch=(type:string,points:{identifier:number;clientX:number;clientY:number}[])=>{
   const event=new Event(type,{bubbles:true,cancelable:true});
   Object.defineProperty(event,'changedTouches',{value:points});
   canvas.dispatchEvent(event);return event;
  };
  const p=(identifier:number,clientX:number,clientY:number)=>({identifier,clientX,clientY});
  document.querySelector<HTMLButtonElement>('#toggle-settings')!.click();
  const start=touch('touchstart',[p(1,300,250),p(2,500,250)]);
  expect(document.querySelector<HTMLElement>('#settings-panel')!.hidden).toBe(true);
  expect(start.defaultPrevented).toBe(true);expect(scene.points.size).toBe(2);
  expect(scene.drag).toBeNull();expect(scene.rotateDrag).toBe(false);
  camera.preRender();const anchor=camera.getWorldPoint(400,250),zoom=camera.zoom;
  expect(touch('touchmove',[p(2,700,250)]).defaultPrevented).toBe(true);
  expect(camera.zoom).toBeCloseTo(Math.min(2.5,zoom*2));
  expect(camera.getWorldPoint(500,250).x).toBeCloseTo(anchor.x,3);
  expect(camera.getWorldPoint(500,250).y).toBeCloseTo(anchor.y,3);
  touch('touchmove',[p(1,340,280),p(2,740,280)]);
  expect(camera.getWorldPoint(540,280).x).toBeCloseTo(anchor.x,3);
  expect(camera.getWorldPoint(540,280).y).toBeCloseTo(anchor.y,3);
  touch('touchmove',[p(1,440,280),p(2,640,280)]);
  expect(camera.zoom).toBeCloseTo(zoom);
  expect(camera.getWorldPoint(540,280).x).toBeCloseTo(anchor.x,3);
  expect(camera.getWorldPoint(540,280).y).toBeCloseTo(anchor.y,3);
  touch('touchend',[p(2,640,280)]);
  const scroll=camera.scrollX;
  touch('touchmove',[p(1,380,280)]);expect(camera.scrollX).toBe(scroll);expect(scene.drag).toBeNull();
  touch('touchcancel',[]);expect(scene.points.size).toBe(0);expect(scene.last).toBeNull();
  const gesture=new Event('gesturechange',{cancelable:true});canvas.dispatchEvent(gesture);expect(gesture.defaultPrevented).toBe(true);
  const resizedZoom=camera.zoom;scene.scale.emit('resize',scene.scale.gameSize,scene.scale.baseSize,scene.scale.displaySize,scene.scale.width,scene.scale.height);expect(camera.zoom).toBe(resizedZoom);
  const wheel=new WheelEvent('wheel',{deltaY:-50,cancelable:true});
  camera.setZoom(1);canvas.dispatchEvent(wheel);expect(camera.zoom).toBeCloseTo(1.1);expect(wheel.defaultPrevented).toBe(true);
 }finally{scene.game?.destroy(true);vi.unstubAllGlobals();}
},10000);
