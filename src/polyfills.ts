/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Comprehensive cross-browser polyfills for legacy browser compatibility:
 * - globalThis (Safari < 12.1, Chrome < 71, Firefox < 65)
 * - crypto.randomUUID (Safari < 15.4, Chrome < 92, Firefox < 95)
 * - Object.fromEntries (Safari < 12.1, Chrome < 73)
 * - Array.prototype.flat / flatMap (Safari < 12, Chrome < 69)
 * - Array.prototype.at / String.prototype.at (Safari < 15.4, Chrome < 92)
 * - String.prototype.replaceAll (Safari < 13.1, Chrome < 85)
 * - Promise.allSettled (Safari < 13, Chrome < 76)
 * - requestIdleCallback / cancelIdleCallback (Safari < 16.4)
 * - queueMicrotask (Chrome < 71, Safari < 12.1)
 * - structuredClone (Safari < 15.4, Chrome < 98)
 * - matchMedia addEventListener compatibility (Safari < 14, older mobile)
 * - Element.prototype.closest & matches (Legacy Edge, IE, older WebViews)
 */

// 1. globalThis polyfill
if (typeof globalThis === 'undefined') {
  (function () {
    if (typeof self !== 'undefined') {
      (self as any).globalThis = self;
    } else if (typeof window !== 'undefined') {
      (window as any).globalThis = window;
    } else if (typeof global !== 'undefined') {
      (global as any).globalThis = global;
    } else {
      Function('return this')().globalThis = Function('return this')();
    }
  })();
}

// 2. crypto & crypto.randomUUID polyfill
if (typeof window !== 'undefined') {
  if (!window.crypto) {
    (window as any).crypto = {} as Crypto;
  }
  if (typeof (window.crypto as any).randomUUID !== 'function') {
    (window.crypto as any).randomUUID = function (): string {
      try {
        if (window.crypto && typeof window.crypto.getRandomValues === 'function') {
          return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c: any) =>
            (c ^ (window.crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
          );
        }
      } catch {
        // Fallback below
      }
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    };
  }
}

// 3. Object.fromEntries polyfill
if (typeof Object.fromEntries !== 'function') {
  Object.fromEntries = function (entries: any): Record<string, any> {
    if (!entries) return {};
    const obj: Record<string, any> = {};
    if (Array.isArray(entries)) {
      for (let i = 0; i < entries.length; i++) {
        const item = entries[i];
        if (item && item.length >= 2) {
          obj[item[0]] = item[1];
        }
      }
    } else if (typeof entries[Symbol.iterator] === 'function') {
      for (const [key, val] of entries) {
        obj[key] = val;
      }
    }
    return obj;
  };
}

// 4. Array.prototype.flat and flatMap
if (!Array.prototype.flat) {
  (Array.prototype as any).flat = function (depth = 1): any[] {
    const d = typeof depth === 'number' ? depth : 1;
    const stack = Array.prototype.slice.call(this);
    const res: any[] = [];
    while (stack.length) {
      const next = stack.pop();
      if (Array.isArray(next) && d > 0) {
        for (let i = 0; i < next.length; i++) {
          stack.push(next[i]);
        }
      } else {
        res.push(next);
      }
    }
    return res.reverse();
  };
}

if (!Array.prototype.flatMap) {
  (Array.prototype as any).flatMap = function (fn: any, thisArg?: any): any[] {
    return (this as any).map(fn, thisArg).flat();
  };
}

// 5. Array.prototype.at and String.prototype.at
if (!Array.prototype.at) {
  (Array.prototype as any).at = function (this: any[], n: number) {
    n = Math.trunc(n) || 0;
    if (n < 0) n += this.length;
    if (n < 0 || n >= this.length) return undefined;
    return this[n];
  };
}

if (!String.prototype.at) {
  (String.prototype as any).at = function (this: string, n: number): string {
    n = Math.trunc(n) || 0;
    if (n < 0) n += this.length;
    if (n < 0 || n >= this.length) return '';
    return this.charAt(n);
  };
}

// 6. String.prototype.replaceAll
if (!String.prototype.replaceAll) {
  (String.prototype as any).replaceAll = function (this: string, searchValue: any, replaceValue: any): string {
    if (searchValue instanceof RegExp) {
      return this.replace(searchValue, replaceValue);
    }
    const escaped = String(searchValue).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return this.replace(new RegExp(escaped, 'g'), replaceValue);
  };
}

// 7. Promise.allSettled
if (!Promise.allSettled) {
  (Promise as any).allSettled = function (promises: Iterable<any>) {
    return Promise.all(
      Array.from(promises).map((p) =>
        Promise.resolve(p).then(
          (value) => ({ status: 'fulfilled' as const, value }),
          (reason) => ({ status: 'rejected' as const, reason })
        )
      )
    );
  };
}

// 8. queueMicrotask
if (typeof window !== 'undefined' && typeof window.queueMicrotask !== 'function') {
  window.queueMicrotask = function (callback: () => void) {
    Promise.resolve()
      .then(callback)
      .catch((err) => {
        setTimeout(() => {
          throw err;
        }, 0);
      });
  };
}

// 9. requestIdleCallback & cancelIdleCallback (Essential for Safari < 16.4)
if (typeof window !== 'undefined') {
  if (typeof (window as any).requestIdleCallback !== 'function') {
    (window as any).requestIdleCallback = function (callback: any, options?: any) {
      const timeout = (options && options.timeout) || 50;
      const start = Date.now();
      return setTimeout(function () {
        callback({
          didTimeout: false,
          timeRemaining: function () {
            return Math.max(0, timeout - (Date.now() - start));
          },
        });
      }, 1);
    };
  }
  if (typeof (window as any).cancelIdleCallback !== 'function') {
    (window as any).cancelIdleCallback = function (handle: any) {
      clearTimeout(handle);
    };
  }
}

// 10. structuredClone fallback
if (typeof window !== 'undefined' && typeof (window as any).structuredClone !== 'function') {
  (window as any).structuredClone = function (obj: any): any {
    if (obj === undefined) return undefined;
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch {
      if (typeof obj === 'object' && obj !== null) {
        return Array.isArray(obj) ? [...obj] : { ...obj };
      }
      return obj;
    }
  };
}

// 11. matchMedia addEventListener compatibility (Safari < 14, Android WebView)
if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  const originalMatchMedia = window.matchMedia;
  window.matchMedia = function (query: string): MediaQueryList {
    const mql = originalMatchMedia.call(window, query);
    if (mql && typeof mql.addEventListener !== 'function') {
      (mql as any).addEventListener = function (type: string, listener: any) {
        if (type === 'change' && typeof mql.addListener === 'function') {
          mql.addListener(listener);
        }
      };
      (mql as any).removeEventListener = function (type: string, listener: any) {
        if (type === 'change' && typeof mql.removeListener === 'function') {
          mql.removeListener(listener);
        }
      };
    }
    return mql;
  };
}

// 12. Element.prototype.closest & matches
if (typeof Element !== 'undefined') {
  if (!Element.prototype.matches) {
    Element.prototype.matches =
      (Element.prototype as any).msMatchesSelector ||
      (Element.prototype as any).webkitMatchesSelector ||
      function (this: Element, s: string): boolean {
        const doc = this.ownerDocument || document;
        const matches = doc.querySelectorAll(s);
        let i = matches.length;
        while (--i >= 0 && matches.item(i) !== this) {}
        return i > -1;
      };
  }

  if (!Element.prototype.closest) {
    Element.prototype.closest = function (this: Element, s: string): Element | null {
      let el: any = this;
      do {
        if (el.matches && el.matches(s)) return el;
        el = el.parentElement || el.parentNode;
      } while (el !== null && el.nodeType === 1);
      return null;
    };
  }
}

// 13. Node.prototype.contains
if (typeof Node !== 'undefined' && !Node.prototype.contains) {
  Node.prototype.contains = function (otherNode: any): boolean {
    if (!otherNode) return false;
    let node = otherNode;
    while (node) {
      if (node === this) return true;
      node = node.parentNode;
    }
    return false;
  };
}

export {};
