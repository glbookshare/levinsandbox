// @vitest-environment happy-dom
import {it,expect,vi} from 'vitest';
import {bindCanvasInput} from './canvas-input';
it('routes touch exactly once even when Safari also emits touch Pointer Events',()=>{
 const canvas=document.createElement('canvas');
 const handlers={down:vi.fn(),move:vi.fn(),up:vi.fn(),cancel:vi.fn(),wheel:vi.fn()};
 const dispose=bindCanvasInput(canvas,handlers);
 canvas.dispatchEvent(new PointerEvent('pointerdown',{pointerType:'touch',pointerId:1}));
 expect(handlers.down).not.toHaveBeenCalled();
 const start=new Event('touchstart',{cancelable:true});
 Object.defineProperty(start,'changedTouches',{value:[{identifier:1,clientX:20,clientY:30}]});
 canvas.dispatchEvent(start);expect(handlers.down).toHaveBeenCalledTimes(1);
 expect(handlers.down.mock.calls[0][0]).toMatchObject({pointerId:-2,pointerType:'touch',clientX:20,clientY:30});
 expect(start.defaultPrevented).toBe(true);
 canvas.dispatchEvent(new PointerEvent('pointerdown',{pointerType:'mouse',pointerId:3}));
 expect(handlers.down).toHaveBeenCalledTimes(2);
 canvas.dispatchEvent(new Event('touchcancel',{cancelable:true}));expect(handlers.cancel).toHaveBeenCalledTimes(1);
 dispose();canvas.dispatchEvent(start);expect(handlers.down).toHaveBeenCalledTimes(2);
});
