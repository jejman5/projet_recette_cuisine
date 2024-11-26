require('@testing-library/jest-dom');

// Mock fetch pour les tests
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([])
  })
);
