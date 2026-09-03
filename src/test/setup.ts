import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});

class ResizeObserver { observe(){} unobserve(){} disconnect(){} }
Object.assign(globalThis,{ResizeObserver});
Object.defineProperty(HTMLElement.prototype,'offsetWidth',{configurable:true,value:800});
Object.defineProperty(HTMLElement.prototype,'offsetHeight',{configurable:true,value:600});
if (!globalThis.DOMMatrixReadOnly) Object.assign(globalThis,{DOMMatrixReadOnly: class { m22=1 }});
