import {it,expect} from 'vitest';
import {createRequire} from 'node:module';
import {BombHold,pushNearby} from './bomb';
import type Phaser from 'phaser';
const require=createRequire(import.meta.url);
const Bodies=require('phaser/src/physics/matter-js/lib/factory/Bodies.js');
const Body=require('phaser/src/physics/matter-js/lib/body/Body.js');
it('fires exactly once only after more than three seconds',()=>{
 const hold=new BombHold(),body=Bodies.circle(0,0,28);
 hold.start(body,1,10,20,100);
 expect(hold.tick(3099)).toBeNull();expect(hold.tick(3100)).toBeNull();expect(hold.progress(1600)).toBe(.5);
 expect(hold.tick(3101)).toBe(body);expect(hold.tick(10000)).toBeNull();
});
it('does not accumulate short taps and cancels when dragged',()=>{
 const hold=new BombHold(),body=Bodies.circle(0,0,28);
 hold.start(body,1,0,0,0);hold.cancel();expect(hold.tick(5000)).toBeNull();
 hold.start(body,2,0,0,6000);expect(hold.tick(8000)).toBeNull();hold.move(2,13,0);expect(hold.tick(10000)).toBeNull();
 hold.start(body,3,0,0,10000);hold.move(3,3,4);expect(hold.tick(13001)).toBe(body);
});
it('pushes nearby dynamic bodies, wakes sleeping toys and leaves platforms alone',()=>{
 const light=Bodies.rectangle(40,0,20,20),heavy=Bodies.rectangle(40,0,20,20),fixed=Bodies.rectangle(10,0,20,20,{isStatic:true}),far=Bodies.circle(500,0,20);
 Body.setMass(heavy,10);Body.set(light,'isSleeping',true);
 pushNearby({body:Body} as Phaser.Physics.Matter.MatterPhysics,[light,heavy,fixed,far],0,0);
 expect(light.isSleeping).toBe(false);expect(light.velocity.x).toBeGreaterThan(heavy.velocity.x);expect(heavy.velocity.x).toBeGreaterThan(0);
 expect(fixed.velocity.x).toBe(0);expect(far.velocity.x).toBe(0);
});
