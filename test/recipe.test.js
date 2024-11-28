import fs from 'fs';
import path from 'path';

const mockDOMElements = {
  'search-bar': { value: '', addEventListener: jest.fn() },
  'recipes': { innerHTML: '', appendChild: jest.fn() },
  'prev-page': { disabled: false, addEventListener: jest.fn() },
  'next-page': { disabled: false, addEventListener: jest.fn() },
  'page-info': { textContent: '' },
  'ingredient-filter': { 
    selectedOptions: [], 
    options: [],
    addEventListener: jest.fn(),
    innerHTML: ''
  },
  'utensil-filter': { 
    selectedOptions: [], 
    options: [],
    addEventListener: jest.fn(),
    innerHTML: ''
  },
  'appliance-filter': { 
    selectedOptions: [], 
    options: [],
    addEventListener: jest.fn(),
    innerHTML: ''
  },
  'ingredient-search': { addEventListener: jest.fn() },
  'utensil-search': { addEventListener: jest.fn() },
  'appliance-search': { addEventListener: jest.fn() },
  'tags-container': { 
    innerHTML: '', 
    querySelector: jest.fn(),
    querySelectorAll: jest.fn(),
    appendChild: jest.fn()
  }
};

document.getElementById = jest.fn((id) => mockDOMElements[id]);

global.fetch = jest.fn(() => 
  Promise.resolve({
    json: () => Promise.resolve([
      {
        name: 'Salade de Tomates',
        description: 'Une délicieuse salade',
        ingredients: [{ ingredient: 'Tomate' }],
        ustensils: ['Couteau'],
        appliance: 'Couteau',
        image: 'salade.jpg',
        time: 15
      },
      {
        name: 'Poulet Rôti',
        description: 'Un poulet savoureux',
        ingredients: [{ ingredient: 'Poulet' }],
        ustensils: ['Four'],
        appliance: 'Four',
        image: 'poulet.jpg',
        time: 60
      }
    ])
  })
);

describe('Recipe Application', () => {
  beforeEach(() => {
    Object.values(mockDOMElements).forEach(element => {
      if (element.innerHTML !== undefined) element.innerHTML = '';
      if (element.addEventListener) element.addEventListener.mockClear();
      if (element.appendChild) element.appendChild.mockClear();
    });
    document.getElementById.mockClear();
    fetch.mockClear();
  });

  it('devrait charger les recettes depuis le fichier JSON', async () => {
    require('../assets/js/script.js');

    const loadEvent = new Event('DOMContentLoaded');
    document.dispatchEvent(loadEvent);

    await new Promise(resolve => setTimeout(resolve, 0));

    expect(fetch).toHaveBeenCalledWith('assets/recipe.json');
  });

  it('devrait configurer correctement les événements', async () => {
    require('../assets/js/script.js');

    const loadEvent = new Event('DOMContentLoaded');
    document.dispatchEvent(loadEvent);

    await new Promise(resolve => setTimeout(resolve, 0));

    expect(mockDOMElements['search-bar'].addEventListener).toHaveBeenCalledWith('input', expect.any(Function));
    expect(mockDOMElements['prev-page'].addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    expect(mockDOMElements['next-page'].addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
  });

  it('devrait filtrer les recettes correctement', async () => {
    const scriptModule = require('../assets/js/script.js');

    const loadEvent = new Event('DOMContentLoaded');
    document.dispatchEvent(loadEvent);

    await new Promise(resolve => setTimeout(resolve, 0));

    const ingredientFilter = mockDOMElements['ingredient-filter'];
    ingredientFilter.selectedOptions = [{ value: 'Tomate' }];
    
    const changeEvent = new Event('change');
    ingredientFilter.dispatchEvent(changeEvent);

    expect(mockDOMElements['tags-container'].appendChild).toHaveBeenCalled();
  });

  it('devrait gérer la pagination', async () => {
    require('../assets/js/script.js');

    const loadEvent = new Event('DOMContentLoaded');
    document.dispatchEvent(loadEvent);

    await new Promise(resolve => setTimeout(resolve, 0));

    const nextPageButton = mockDOMElements['next-page'];
    nextPageButton.dispatchEvent(new Event('click'));

    expect(mockDOMElements['page-info'].textContent).toMatch(/Page \d+ sur \d+/);
  });

  it('devrait gérer la recherche', async () => {
    require('../assets/js/script.js');

    const loadEvent = new Event('DOMContentLoaded');
    document.dispatchEvent(loadEvent);

    await new Promise(resolve => setTimeout(resolve, 0));

    const searchBar = mockDOMElements['search-bar'];
    searchBar.value = 'Salade';
    searchBar.dispatchEvent(new Event('input'));

    expect(mockDOMElements['tags-container'].appendChild).toHaveBeenCalled();
  });
});