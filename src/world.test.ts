import {describe,it,expect} from 'vitest';
import {decode,encode,type World} from './world';
const world:World={version:1,name:'Test',gravity:1,items:[{id:'one',kind:'box',x:1,y:2,angle:.4,vx:3,vy:4,av:.1,color:123,isStatic:false,friction:.5,restitution:.4,density:.001}]};
describe('versioned world schema',()=>{
 it('round trips all physics properties',()=>expect(decode(JSON.parse(encode(world)))).toEqual(world));
 it('isolates deserialized data',()=>{const w=decode(world);w.items[0].x=90;expect(world.items[0].x).toBe(1);});
 it('rejects unknown versions without mutating data',()=>{expect(()=>decode({...world,version:2})).toThrow();expect(world.version).toBe(1);});
 it('rejects corrupt data and duplicate identities',()=>{expect(()=>decode({...world,items:[{...world.items[0],x:NaN}]})).toThrow();expect(()=>decode({...world,items:[world.items[0],world.items[0]]})).toThrow();});
});

it('rejects incomplete or corrupt articulated poses',()=>{
 const human={...world.items[0],kind:'human',parts:[{x:1,y:2,angle:0,vx:0,vy:0,av:0}]};
 expect(()=>decode({...world,items:[human]})).toThrow('Invalid human');
 expect(()=>decode({...world,items:[{...human,parts:Array.from({length:5},()=>({...human.parts[0],vx:Infinity}))}]})).toThrow('Invalid human');
});
