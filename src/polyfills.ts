/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Comprehensive cross-browser polyfills for modern and legacy browsers (Chrome, Firefox, Safari, Edge):
 * Fully encapsulated in safe execution blocks to prevent strict-mode crashes in Google Chrome / V8.
 */

// 1. globalThis polyfill
try {
  if (typeof globalThis === 'undefined') {
    (function () {
      if (typeof self !== 'undefined') {
        (self as any).globalThis = self;
      } else if (typeof window !== 'undefined') {
        (window as any).globalThis = window;
      } else if (typeof global !== 'undefined') {
        (global as any).globalThis = global;
      }
    })();
  }
} catch {
  // Silent fallback
}

// 2. crypto & crypto.randomUUID polyfill
try {
  if (typeof window !== 'undefined') {
    if (!window.crypto) {
      try {
        (window as any).crypto = {} as Crypto;
      } catch {
        // Ignored if window.crypto is a read-only getter
      }
    }
    if (window.crypto && typeof (window.crypto as any).randomUUID !== 'function') {
      const genUUID = function (): string {
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

      try {
        Object.defineProperty(window.crypto, 'randomUUID', {
          value: genUUID,
          writable: true,
          configurable: true,
        });
      } catch {
        try {
          (window.crypto as any).randomUUID = genUUID;
        } catch {
          // Object may be non-extensible in Chrome
        }
      }
    }
  }
} catch {
  // Safe
}

// 3. Object.fromEntries polyfill
try {
  if (typeof Object.fromEntries !== 'function') {
    Object.defineProperty(Object, 'fromEntries', {
      value: function (entries: any): Record<string, any> {
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
      },
      writable: true,
      configurable: true,
    });
  }
} catch {
  // Safe
}

// 4. Array.prototype.flat and flatMap
try {
  if (!Array.prototype.flat) {
    Object.defineProperty(Array.prototype, 'flat', {
      value: function (depth = 1): any[] {
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
      },
      writable: true,
      configurable: true,
    });
  }

  if (!Array.prototype.flatMap) {
    Object.defineProperty(Array.prototype, 'flatMap', {
      value: function (fn: any, thisArg?: any): any[] {
        return (this as any).map(fn, thisArg).flat();
      },
      writable: true,
      configurable: true,
    });
  }
} catch {
  // Safe
}

// 5. Array.prototype.at and String.prototype.at
try {
  if (!Array.prototype.at) {
    Object.defineProperty(Array.prototype, 'at', {
      value: function (this: any[], n: number) {
        n = Math.trunc(n) || 0;
        if (n < 0) n += this.length;
        if (n < 0 || n >= this.length) return undefined;
        return this[n];
      },
      writable: true,
      configurable: true,
    });
  }

  if (!String.prototype.at) {
    Object.defineProperty(String.prototype, 'at', {
      value: function (this: string, n: number): string {
        n = Math.trunc(n) || 0;
        if (n < 0) n += this.length;
        if (n < 0 || n >= this.length) return '';
        return this.charAt(n);
      },
      writable: true,
      configurable: true,
    });
  }
} catch {
  // Safe
}

// 6. String.prototype.replaceAll
try {
  if (!String.prototype.replaceAll) {
    Object.defineProperty(String.prototype, 'replaceAll', {
      value: function (this: string, searchValue: any, replaceValue: any): string {
        if (searchValue instanceof RegExp) {
          return this.replace(searchValue, replaceValue);
        }
        const escaped = String(searchValue).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return this.replace(new RegExp(escaped, 'g'), replaceValue);
      },
      writable: true,
      configurable: true,
    });
  }
} catch {
  // Safe
}

// 7. Promise.allSettled
try {
  if (!Promise.allSettled) {
    Object.defineProperty(Promise, 'allSettled', {
      value: function (promises: Iterable<any>) {
        return Promise.all(
          Array.from(promises).map((p) =>
            Promise.resolve(p).then(
              (value) => ({ status: 'fulfilled' as const, value }),
              (reason) => ({ status: 'rejected' as const, reason })
            )
          )
        );
      },
      writable: true,
      configurable: true,
    });
  }
} catch {
  // Safe
}

// 8. queueMicrotask
try {
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
} catch {
  // Safe
}

// 9. requestIdleCallback & cancelIdleCallback (Essential for Safari < 16.4)
try {
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
} catch {
  // Safe
}

// 10. structuredClone fallback
try {
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
} catch {
  // Safe
}

// 11. matchMedia addEventListener compatibility (Safari < 14, Android WebView)
// In Chrome, window.matchMedia already has addEventListener and is often a non-writable property.
try {
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    const testMql = window.matchMedia('(min-width: 0px)');
    // Only patch if addEventListener is truly missing on the MediaQueryList instance!
    if (testMql && typeof testMql.addEventListener !== 'function') {
      const originalMatchMedia = window.matchMedia;
      const patchedMatchMedia = function (query: string): MediaQueryList {
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

      try {
        Object.defineProperty(window, 'matchMedia', {
          value: patchedMatchMedia,
          writable: true,
          configurable: true,
        });
      } catch {
        try {
          (window as any).matchMedia = patchedMatchMedia;
        } catch {
          // Read-only in this engine
        }
      }
    }
  }
} catch {
  // Safe
}

// 12. Element.prototype.closest & matches
try {
  if (typeof Element !== 'undefined') {
    if (!Element.prototype.matches) {
      (Element.prototype as any).matches =
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
} catch {
  // Safe
}

// 13. Node.prototype.contains
try {
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
} catch {
  // Safe
}

export {};
