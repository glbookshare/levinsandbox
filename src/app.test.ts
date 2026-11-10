// @vitest-environment happy-dom
import {it,expect,vi} from 'vitest';
import {createCanvas,Image,type Canvas} from '@napi-rs/canvas';
vi.mock('virtual:pwa-register',()=>({registerSW:vi.fn()}));
vi.mock('./storage',()=>({load:async()=>null,save:async()=>{},loadLanguage:async()=>null,saveLanguage:async()=>{}}));
it('boots real Phaser and adds toys through mouse clicks on the HTML tray',async()=>{
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
  const before=scene.objects.length;
  const buttons=Array.from(document.querySelectorAll<HTMLButtonElement>('[data-kind]'));
  expect(buttons).toHaveLength(7);
  buttons.forEach((button,i)=>{button.click();expect(scene.objects.length).toBe(before+i+1);expect(scene.selected).toBe(scene.objects.at(-1)!.body);});
  expect(scene.humans.size).toBe(1);
  await vi.waitFor(()=>{expect(errors).toEqual([]);expect(scene.game.loop.frame).toBeGreaterThan(4);});
 }finally{scene.game?.destroy(true);vi.unstubAllGlobals();}
},10000);
