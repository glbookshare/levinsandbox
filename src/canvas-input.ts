/** One input stream per device: Safari Touch Events, Pointer Events for mouse/pen. */
export interface PointerSample {
 pointerId:number;pointerType:string;clientX:number;clientY:number;preventDefault():void;
}
interface Handlers {down:(event:PointerSample)=>void;move:(event:PointerSample)=>void;up:(event:PointerSample)=>void;cancel:()=>void;wheel:(event:WheelEvent)=>void}
export function bindCanvasInput(canvas:HTMLCanvasElement,handlers:Handlers):()=>void {
 const dispose:(()=>void)[]=[];
 const on=(type:string,callback:EventListener,options:AddEventListenerOptions={})=>{
  canvas.addEventListener(type,callback,options);
  dispose.push(()=>canvas.removeEventListener(type,callback,options));
 };
 for(const [type,handler] of [['pointerdown',handlers.down],['pointermove',handlers.move],['pointerup',handlers.up]] as const){
  on(type,event=>{const pointer=event as PointerEvent;if(pointer.pointerType!=='touch')handler(pointer);},{passive:false});
 }
 on('pointercancel',event=>{if((event as PointerEvent).pointerType!=='touch')handlers.cancel();});
 on('lostpointercapture',event=>{if((event as PointerEvent).pointerType!=='touch')handlers.cancel();});
 for(const [type,handler] of [['touchstart',handlers.down],['touchmove',handlers.move],['touchend',handlers.up]] as const){
  // Capture before Phaser's own touch listeners and explicitly opt out of passive
  // handling. Safari must not claim the gesture for page scrolling/zooming.
  on(type,event=>{
   const touch=event as TouchEvent;
   if(touch.cancelable)touch.preventDefault();
   touch.stopPropagation();
   for(const point of Array.from(touch.changedTouches))handler({pointerId:-point.identifier-1,pointerType:'touch',clientX:point.clientX,clientY:point.clientY,preventDefault:()=>{}});
  },{passive:false,capture:true});
 }
 on('touchcancel',event=>{if(event.cancelable)event.preventDefault();event.stopPropagation();handlers.cancel();},{passive:false,capture:true});
 for(const type of ['gesturestart','gesturechange','gestureend'])on(type,event=>{if(event.cancelable)event.preventDefault();},{passive:false,capture:true});
 on('wheel',event=>handlers.wheel(event as WheelEvent),{passive:false});
 window.addEventListener('blur',handlers.cancel);
 dispose.push(()=>window.removeEventListener('blur',handlers.cancel));
 return()=>{dispose.forEach(remove=>remove());handlers.cancel();};
}
