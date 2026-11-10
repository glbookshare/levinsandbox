export type Kind = 'box'|'ball'|'plank'|'ramp'|'platform'|'wheel'|'human';
export interface Motion {x:number;y:number;angle:number;vx:number;vy:number;av:number}
export interface Item {parts?:Motion[];id:string;kind:Kind;x:number;y:number;angle:number;vx:number;vy:number;av:number;color:number;isStatic:boolean;friction:number;restitution:number;density:number}
export interface World {version:1;name:string;gravity:number;items:Item[]}
export function decode(value:unknown):World {
 const w=value as World;
 if(!w || w.version!==1 || typeof w.name!=='string' || !Number.isFinite(w.gravity) || Math.abs(w.gravity)>3 || !Array.isArray(w.items)||w.items.length>150)throw Error('Unsupported or invalid world');
 const ids=new Set<string>();
 for(const i of w.items){if(!['box','ball','plank','ramp','platform','wheel','human'].includes(i.kind)||typeof i.id!=='string'||ids.has(i.id)||typeof i.isStatic!=='boolean'||!['x','y','angle','vx','vy','av','color','friction','restitution','density'].every(k=>Number.isFinite(i[k as keyof Item]))||i.density<=0||i.friction<0||i.restitution<0||i.restitution>1)throw Error('Invalid object');if(i.parts!==undefined&&(i.kind!=='human'||!Array.isArray(i.parts)||i.parts.length!==5||!i.parts.every(p=>p&&['x','y','angle','vx','vy','av'].every(k=>Number.isFinite(p[k as keyof Motion])))))throw Error('Invalid human');ids.add(i.id);}
 if(w.items.reduce((n,i)=>n+(i.kind==='human'?6:1),0)>150)throw Error('Too many physics bodies');
 return structuredClone(w);
}
export const encode=(world:World)=>JSON.stringify(decode(world));
