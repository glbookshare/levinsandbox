import {beforeEach,it,expect,vi} from 'vitest';
import {createRequire} from 'node:module';
vi.mock('phaser',()=>({default:{Scene:class {}}}));
vi.mock('./main',()=>({changed:vi.fn(),toast:vi.fn()}));
import {Playground} from './scene';
import {decode,encode,type Kind} from './world';
const require=createRequire(import.meta.url);
const root='phaser/src/physics/matter-js/lib/';
const Bodies=require(root+'factory/Bodies.js'),Body=require(root+'body/Body.js'),Composite=require(root+'body/Composite.js'),Constraint=require(root+'constraint/Constraint.js'),Engine=require(root+'core/Engine.js');
let scene:Playground;
beforeEach(()=>{
 vi.stubGlobal('document',{querySelectorAll:()=>[],querySelector:()=>({classList:{toggle:vi.fn()},textContent:'',value:''})});
 scene=new Playground();const engine=Engine.create();
 const add=(b:any)=>{Composite.add(engine.world,b);return b;};
 (scene as any).matter={body:Body,world:{engine,remove:(b:any)=>Composite.remove(engine.world,b),removeConstraint:(j:any)=>Composite.remove(engine.world,j),setGravity:(x:number,y:number)=>{engine.gravity.x=x;engine.gravity.y=y;}},add:{rectangle:(...a:any[])=>add(Bodies.rectangle(...a)),circle:(...a:any[])=>add(Bodies.circle(...a)),fromVertices:(...a:any[])=>add(Bodies.fromVertices(...a)),constraint:(a:any,b:any,length:number,stiffness:number,opts:any)=>add(Constraint.create({...opts,bodyA:a,bodyB:b,length,stiffness}))}};
 (scene as any).cameras={main:{width:800,height:600,getWorldPoint:(x:number,y:number)=>({x,y})}};
});
it('adds each tray toy immediately in view and selects it',()=>{
 for(const kind of ['box','ball','plank','ramp','platform','wheel','human'] as Kind[]){const b=scene.addToy(kind)!;expect(b).toBeTruthy();expect(scene.selected).toBe(b);expect(b.position.x).toBeCloseTo(400);expect(b.position.y).toBeCloseTo(210);expect(scene.tool).toBe('select');}
 expect(scene.objects.length).toBe(7);
});
it('restores articulated figure poses and removes every joint and body',()=>{
 scene.addToy('human');const human=scene.humans.get(scene.selected!)!;
 expect(human.parts).toHaveLength(5);expect(human.joints).toHaveLength(5);
 for(let i=0;i<30;i++)Engine.update(scene.matter.world.engine,1000/60);
 const saved=decode(JSON.parse(encode(scene.snapshot())));
 scene.restore(saved);expect(scene.snapshot()).toEqual(saved);
 scene.selected=scene.objects[0].body;scene.rotate();expect(scene.humans.get(scene.selected)!.parts[0].position.x).not.toBe(saved.items[0].parts![0].x);
 scene.removeSelected();expect(scene.objects).toHaveLength(0);expect(Composite.allBodies(scene.matter.world.engine.world)).toHaveLength(0);expect(Composite.allConstraints(scene.matter.world.engine.world)).toHaveLength(0);
});
it('counts figure parts toward the physics budget',()=>{for(let i=0;i<25;i++)scene.addToy('human');expect(scene.objects).toHaveLength(25);expect(scene.addToy('box')).toBeUndefined();});
