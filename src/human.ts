import type Phaser from 'phaser';
import type {Motion} from './world';
type Body=MatterJS.BodyType;
export interface Human {parts:Body[];joints:MatterJS.ConstraintType[]}
export const motion=(b:Body):Motion=>({x:b.position.x,y:b.position.y,angle:b.angle,vx:b.velocity.x,vy:b.velocity.y,av:b.angularVelocity});
export function createHuman(scene:Phaser.Scene,torso:Body,states?:Motion[]):Human{
 const group=scene.matter.body.nextGroup(true);
 torso.collisionFilter.group=group;
 const {x,y}=torso.position;
 const opts={collisionFilter:{group},friction:.5,restitution:.05,density:.001,sleepThreshold:90};
 const parts=[scene.matter.add.circle(x,y-39,18,opts),scene.matter.add.rectangle(x-28,y,14,48,opts),scene.matter.add.rectangle(x+28,y,14,48,opts),scene.matter.add.rectangle(x-12,y+53,17,56,opts),scene.matter.add.rectangle(x+12,y+53,17,56,opts)];
 const anchors=[{a:{x:0,y:-22},b:{x:0,y:18}},{a:{x:-17,y:-19},b:{x:0,y:-20}},{a:{x:17,y:-19},b:{x:0,y:-20}},{a:{x:-12,y:25},b:{x:0,y:-27}},{a:{x:12,y:25},b:{x:0,y:-27}}];
 const joints=parts.map((part,i)=>scene.matter.add.constraint(torso,part,2,.85,{pointA:anchors[i].a,pointB:anchors[i].b,damping:.15}));
 parts.forEach((b,i)=>{const s=states?.[i];if(s){scene.matter.body.setPosition(b,{x:s.x,y:s.y});scene.matter.body.setAngle(b,s.angle);scene.matter.body.setVelocity(b,{x:s.vx,y:s.vy});scene.matter.body.setAngularVelocity(b,s.av);}});
 return{parts,joints};
}
export function drawHuman(g:Phaser.GameObjects.Graphics,torso:Body,human:Human){
 const [head,...limbs]=human.parts;
 for(const [i,b] of [torso,...limbs].entries()){
  g.save();g.translateCanvas(b.position.x,b.position.y);g.rotateCanvas(b.angle);
  g.fillStyle(i===0?0x67ac9d:i<3?0xf0c69c:0x789bc7);const w=i===0?36:i<3?14:17;const h=i===0?50:i<3?48:56;
  g.fillRoundedRect(-w/2,-h/2,w,h,7);g.lineStyle(2,0x34544c,.25);g.strokeRoundedRect(-w/2,-h/2,w,h,7);g.restore();
 }
 g.save();g.translateCanvas(head.position.x,head.position.y);g.rotateCanvas(head.angle);g.fillStyle(0xf0c69c);g.fillCircle(0,0,18);g.fillStyle(0x3c5148);g.fillCircle(-6,-3,2);g.fillCircle(6,-3,2);g.lineStyle(2,0x3c5148);g.beginPath();g.arc(0,2,7,0,Math.PI);g.strokePath();g.restore();
}
