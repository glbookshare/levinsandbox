import type Phaser from 'phaser';
export const HOLD_MS=3000;
export const POP_RADIUS=240;
/** A hold belongs to one pointer. Moving, lifting or multitouch cancels it. */
export class BombHold {
 active:{body:MatterJS.BodyType;pointer:number;x:number;y:number;started:number}|null=null;
 start(body:MatterJS.BodyType,pointer:number,x:number,y:number,now:number){this.active={body,pointer,x,y,started:now};}
 move(pointer:number,x:number,y:number){if(this.active?.pointer===pointer&&Math.hypot(x-this.active.x,y-this.active.y)>12)this.cancel();}
 cancel(){this.active=null;}
 progress(now:number){return this.active?Math.min(1,Math.max(0,(now-this.active.started)/HOLD_MS)):0;}
 tick(now:number){if(!this.active||now-this.active.started<=HOLD_MS)return null;const body=this.active.body;this.cancel();return body;}
}
export function pushNearby(physics:Phaser.Physics.Matter.MatterPhysics,bodies:MatterJS.BodyType[],x:number,y:number){
 for(const body of bodies){
  if(body.isStatic)continue;
  const dx=body.position.x-x,dy=body.position.y-y,distance=Math.hypot(dx,dy);
  if(distance>=POP_RADIUS)continue;
  const speed=(1-distance/POP_RADIUS)*Math.min(12,7/Math.max(.5,body.mass));
  const nx=distance>.001?dx/distance:0,ny=distance>.001?dy/distance:-1;
  // Body.set routes this property through Matter.Sleeping.set, waking resting toys.
  physics.body.set(body,'isSleeping',false);
  physics.body.setVelocity(body,{x:Math.max(-24,Math.min(24,body.velocity.x+nx*speed)),y:Math.max(-24,Math.min(24,body.velocity.y+ny*speed))});
 }
}
export interface ConfettiPop {x:number;y:number;started:number}
export function drawBomb(g:Phaser.GameObjects.Graphics,body:MatterJS.BodyType){
 g.save();g.translateCanvas(body.position.x,body.position.y);g.rotateCanvas(body.angle);
 g.fillStyle(0x997ac6);g.fillCircle(0,0,28);g.lineStyle(3,0x74599b);g.strokeCircle(0,0,27);
 g.fillStyle(0x80beaa);g.fillRoundedRect(-10,-34,20,12,4);
 g.fillStyle(0xf8d16c);const star=Array.from({length:10},(_,i)=>{const a=i*Math.PI/5-Math.PI/2,r=i%2?6:14;return{x:Math.cos(a)*r,y:Math.sin(a)*r};});g.fillPoints(star,true);
 g.fillStyle(0xffffff,.3);g.fillCircle(-12,-12,5);g.restore();
}
export function drawPops(g:Phaser.GameObjects.Graphics,pops:ConfettiPop[],now:number){
 const colors=[0xe8ac55,0xec7c83,0x79b99a,0x8aa7d4,0x997ac6];
 for(const pop of pops){const age=(now-pop.started)/1000;if(age<0||age>1)continue;
  g.lineStyle(4,0xe8ac55,(1-age)*.55);g.strokeCircle(pop.x,pop.y,20+age*POP_RADIUS);
  for(let i=0;i<28;i++){const angle=i*2.39996,speed=60+(i%5)*28;g.save();g.translateCanvas(pop.x+Math.cos(angle)*speed*age,pop.y+Math.sin(angle)*speed*age+80*age*age);g.rotateCanvas(angle+age*4);g.fillStyle(colors[i%colors.length],1-age);g.fillRect(-3,-5,6,10);g.restore();}
 }
}
