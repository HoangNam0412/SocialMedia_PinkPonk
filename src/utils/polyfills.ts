/**
 * This file contains polyfills needed for SockJS and other libraries
 * that expect Node.js globals in the browser environment.
 */

// Polyfill for global object
if (typeof window !== 'undefined') {
  (window as any).global = window;
}

// Polyfill for Node.js process
if (typeof window !== 'undefined' && !(window as any).process) {
  (window as any).process = {
    env: { DEBUG: undefined },
    version: '',
    nextTick: (fn: Function) => {
      setTimeout(fn, 0);
    }
  };
}

// Polyfill for Buffer
if (typeof window !== 'undefined' && !(window as any).Buffer) {
  (window as any).Buffer = {
    isBuffer: () => false
  };
}

export default function applyPolyfills() {
  // This function is just a marker to ensure the polyfills are included
  console.log('Browser polyfills applied');
} 