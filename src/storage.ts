import {openDB} from 'idb';
import {decode, type World} from './world';
const db=()=>openDB('pocket-physics',1,{upgrade(db){db.createObjectStore('worlds');db.createObjectStore('preferences');}});
export async function save(world:World){const data=decode(world);const d=await db();await d.put('worlds',data,'playground');}
export async function load(){const d=await db();const w=await d.get('worlds','playground');return w?decode(w):null;}

export async function saveLanguage(language:'en'|'de'){const d=await db();await d.put('preferences',language,'language');}
export async function loadLanguage():Promise<'en'|'de'|null>{const d=await db();const v=await d.get('preferences','language');return v==='en'||v==='de'?v:null;}
