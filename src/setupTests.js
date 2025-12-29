import '@testing-library/jest-dom';

// Suppress jsdom "Not implemented" warnings that go directly to stderr
const originalStderrWrite = process.stderr.write.bind(process.stderr);
process.stderr.write = (chunk, encoding, callback) => {
  if (typeof chunk === 'string' && chunk.includes('Not implemented')) {
    return true;
  }
  return originalStderrWrite(chunk, encoding, callback);
};

// Suppress jsdom "Not implemented" warnings via console.error
const originalConsoleError = console.error;
console.error = (...args) => {
  if (args[0]?.includes?.('Not implemented')) {
    return;
  }
  originalConsoleError.apply(console, args);
};

// Mock window.location.reload to prevent jsdom "Not implemented: navigation" warning
Object.defineProperty(window, 'location', {
  configurable: true,
  value: {
    ...window.location,
    reload: () => {},
    assign: () => {},
    replace: () => {},
  },
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // Deprecated
    removeListener: () => {}, // Deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});