import type Phaser from 'phaser';
import type {Motion} from './world';
export interface Car {parts:MatterJS.BodyType[];joints:MatterJS.ConstraintType[]}
export function createCar(scene:Phaser.Scene,chassis:MatterJS.BodyType,states?:Motion[]):Car {
 const group=scene.matter.body.nextGroup(true);chassis.collisionFilter.group=group;
 const anchors=[{x:-72,y:36},{x:72,y:36}];
 const offsets=anchors.map(p=>({x:p.x*Math.cos(chassis.angle)-p.y*Math.sin(chassis.angle),y:p.x*Math.sin(chassis.angle)+p.y*Math.cos(chassis.angle)}));
 const parts=offsets.map((offset,i)=>{
  const wheel=scene.matter.add.circle(chassis.position.x+offset.x,chassis.position.y+offset.y,30,{collisionFilter:{group},friction:.85,frictionAir:.008,restitution:.05,density:.0015});
  const state=states?.[i];
  if(state){scene.matter.body.setPosition(wheel,{x:state.x,y:state.y});scene.matter.body.setAngle(wheel,state.angle);scene.matter.body.setVelocity(wheel,{x:state.vx,y:state.vy});scene.matter.body.setAngularVelocity(wheel,state.av);}
  else{scene.matter.body.setAngle(wheel,chassis.angle);scene.matter.body.setVelocity(wheel,chassis.velocity);}
  return wheel;
 });
 const joints=parts.map((wheel,i)=>scene.matter.add.constraint(chassis,wheel,0,1,{pointA:offsets[i],pointB:{x:0,y:0},damping:.1}));
 return {parts,joints};
}
export function drawCar(g:Phaser.GameObjects.Graphics,chassis:MatterJS.BodyType,car:Car){
 g.save();g.translateCanvas(chassis.position.x,chassis.position.y);g.rotateCanvas(chassis.angle);
 g.fillStyle(0x70a5d2);g.fillRoundedRect(-110,-5,220,37,12);
 g.fillStyle(0x70a5d2);g.fillRoundedRect(-61,-32,120,40,15);
 g.lineStyle(3,0x4b7faa);g.strokeRoundedRect(-110,-5,220,37,12);
 g.fillStyle(0xd8f1e9);g.fillRoundedRect(-49,-23,42,24,6);g.fillRoundedRect(3,-23,42,24,6);
 g.fillStyle(0xf5cf71);g.fillRoundedRect(94,2,13,11,4);
 g.fillStyle(0xef9c8b);g.fillRoundedRect(-108,2,10,11,4);
 g.lineStyle(2,0x4b7faa);g.lineBetween(-3,5,-3,24);g.lineBetween(7,9,18,9);
 g.fillStyle(0xd6e8ed);g.fillRoundedRect(-116,20,15,10,4);g.fillRoundedRect(102,20,15,10,4);
 g.restore();
 for(const wheel of car.parts){
  g.save();g.translateCanvas(wheel.position.x,wheel.position.y);g.rotateCanvas(wheel.angle);
  g.fillStyle(0x506776);g.fillCircle(0,0,30);g.lineStyle(3,0x394e60);g.strokeCircle(0,0,28);
  g.fillStyle(0xe1e7dc);g.fillCircle(0,0,18);g.lineStyle(3,0x8ba1aa);
  for(let i=0;i<6;i++){const a=i*Math.PI/3;g.lineBetween(0,0,Math.cos(a)*15,Math.sin(a)*15);}
  g.fillStyle(0xf0c66e);g.fillCircle(0,0,6);g.restore();
 }
}
