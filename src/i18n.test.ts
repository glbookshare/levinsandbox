import {describe,it,expect} from 'vitest';
import {detectLanguage,german} from './i18n';
describe('language selection',()=>{
 it('recognizes German locales',()=>{expect(detectLanguage(['de-DE'])).toBe('de');expect(detectLanguage(['de-AT'])).toBe('de');});
 it('uses English for English and unsupported locales',()=>{expect(detectLanguage(['en-GB'])).toBe('en');expect(detectLanguage(['fr-FR'])).toBe('en');expect(detectLanguage([])).toBe('en');});
 it('includes translated controls, help, and storage warnings',()=>{for(const key of ['Play','Gravity','How to play','Storage unavailable','Reset your playground to the starter toys?'])expect(german[key]?.length).toBeGreaterThan(0);});
});

import {vi} from 'vitest';
import {captureTranslations,setLanguage,t,addHint} from './i18n';
it('switches both ways and translates combined hints without rebuilding the view',()=>{
 const text={data:'One finger to move toys · Two fingers to pan & zoom',parentElement:{closest:()=>null}};
 const label={value:'How to play',getAttribute:()=> 'How to play',setAttribute:(_key:string,value:string)=>{label.value=value;}};
 const root={querySelectorAll:()=>[label]} as unknown as HTMLElement;
 vi.stubGlobal('NodeFilter',{SHOW_TEXT:4});
 vi.stubGlobal('document',{documentElement:{lang:'en'},title:'',createTreeWalker:()=>{let done=false;return{currentNode:text,nextNode(){if(done)return false;done=true;return true;}};}});
 try{
  captureTranslations(root);setLanguage('de',root);
  expect(text.data).toBe('Ein Finger bewegt Spielzeuge · Zwei Finger verschieben und zoomen');
  expect(label.value).toBe('So geht’s');expect(t('Play')).toBe('Spielen');expect(addHint('box')).toContain('eine Kiste');
  setLanguage('en',root);expect(label.value).toBe('How to play');expect(text.data).toContain('Two fingers to pan & zoom');expect(t('Play')).toBe('Play');
 }finally{vi.unstubAllGlobals();}
});
