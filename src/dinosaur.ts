import type Phaser from 'phaser';
/** A solid toy made of connected collision shapes; no loose limbs or animation. */
export function createDinosaur(scene:Phaser.Scene,x:number,y:number,options:MatterJS.IBodyDefinition):MatterJS.BodyType {
 const add=scene.matter.add;
 const pieces=[
  add.rectangle(0,0,100,56,options),
  add.rectangle(-30,37,20,32,options),add.rectangle(30,37,20,32,options),
  add.rectangle(42,-49,24,70,options),add.circle(57,-89,23,options),
  add.rectangle(72,-87,30,24,options),
  add.fromVertices(-76,-4,[{x:-36,y:-10},{x:20,y:-18},{x:20,y:18}],options) as MatterJS.BodyType
 ];
 pieces.forEach(piece=>scene.matter.world.remove(piece));
 const body=scene.matter.body.create({...options,parts:pieces});
 scene.matter.body.setPosition(body,{x,y});scene.matter.world.add(body);
 return body;
}
export function drawDinosaur(g:Phaser.GameObjects.Graphics,body:MatterJS.BodyType){
 const torso=body.parts[1],tail=body.parts[7];
 g.fillStyle(0x79b99a);g.fillPoints(tail.vertices!,true);g.lineStyle(2,0x4c8f72);g.strokePoints(tail.vertices!,true);
 g.save();g.translateCanvas(torso.position.x,torso.position.y);g.rotateCanvas(body.angle);
 // Feet, belly, long neck and round head form one friendly long-necked dinosaur.
 g.fillStyle(0x68a98a);g.fillRoundedRect(-40,18,20,35,8);g.fillRoundedRect(20,18,20,35,8);
 g.fillStyle(0x79b99a);g.fillRoundedRect(-50,-28,100,56,20);g.fillRoundedRect(30,-84,24,77,11);g.fillCircle(57,-89,23);g.fillRoundedRect(57,-99,32,24,10);
 g.fillStyle(0xbce0aa);g.fillEllipse(-2,7,64,34);g.fillRoundedRect(39,-67,9,50,4);
 g.fillStyle(0xf2ca76);
 for(let i=0;i<4;i++){const x=-42+i*18;g.fillTriangle(x-7,-25,x+7,-25,x,-39);}
 g.fillStyle(0x4c8f72);g.fillCircle(-29,-4,4);g.fillCircle(-14,-13,3);g.fillCircle(12,-9,4);
 g.fillStyle(0xffffff);g.fillCircle(65,-97,7);g.fillStyle(0x354e40);g.fillCircle(67,-97,3.5);g.fillCircle(82,-90,1.5);
 g.lineStyle(2,0x4c765d);g.beginPath();g.arc(76,-86,7,0,Math.PI);g.strokePath();
 g.fillStyle(0xd8e6bf);for(const x of [-35,-29,25,31])g.fillRoundedRect(x,46,4,6,2);
 g.restore();
}
