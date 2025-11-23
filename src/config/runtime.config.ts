
export function detectRuntime(): Runtime {
  if (typeof process !== 'undefined' && process.versions?.node) {
    return 'node';
  }

  ///...other runtime
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    return 'web';
  }

  if (typeof globalThis !== 'undefined' && globalThis.crypto?.subtle) {
    return 'web';
  }

  return 'web'
}
