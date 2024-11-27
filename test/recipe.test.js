import fs from 'fs';
import path from 'path';

// Mock des éléments du DOM
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

// Mock de la fonction document.getElementById
document.getElementById = jest.fn((id) => mockDOMElements[id]);

// Mock de fetch
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
    // Réinitialiser les mocks
    Object.values(mockDOMElements).forEach(element => {
      if (element.innerHTML !== undefined) element.innerHTML = '';
      if (element.addEventListener) element.addEventListener.mockClear();
      if (element.appendChild) element.appendChild.mockClear();
    });
    document.getElementById.mockClear();
    fetch.mockClear();
  });

  it('devrait charger les recettes depuis le fichier JSON', async () => {
    // Importer le script
    require('../assets/js/script.js');

    // Simuler l'événement DOMContentLoaded
    const loadEvent = new Event('DOMContentLoaded');
    document.dispatchEvent(loadEvent);

    // Attendre que le fetch soit résolu
    await new Promise(resolve => setTimeout(resolve, 0));

    // Vérifier que fetch a été appelé avec le bon chemin
    expect(fetch).toHaveBeenCalledWith('assets/recipe.json');
  });

  it('devrait configurer correctement les événements', async () => {
    // Importer le script
    require('../assets/js/script.js');

    // Simuler l'événement DOMContentLoaded
    const loadEvent = new Event('DOMContentLoaded');
    document.dispatchEvent(loadEvent);

    // Attendre que le fetch soit résolu
    await new Promise(resolve => setTimeout(resolve, 0));

    // Vérifier les événements principaux
    expect(mockDOMElements['search-bar'].addEventListener).toHaveBeenCalledWith('input', expect.any(Function));
    expect(mockDOMElements['prev-page'].addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    expect(mockDOMElements['next-page'].addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
  });

  it('devrait filtrer les recettes correctement', async () => {
    // Importer le script
    const scriptModule = require('../assets/js/script.js');

    // Simuler l'événement DOMContentLoaded
    const loadEvent = new Event('DOMContentLoaded');
    document.dispatchEvent(loadEvent);

    // Attendre que le fetch soit résolu
    await new Promise(resolve => setTimeout(resolve, 0));

    // Simuler la sélection de filtres
    const ingredientFilter = mockDOMElements['ingredient-filter'];
    ingredientFilter.selectedOptions = [{ value: 'Tomate' }];
    
    // Déclencher l'événement de changement
    const changeEvent = new Event('change');
    ingredientFilter.dispatchEvent(changeEvent);

    // Vérifier que les tags ont été mis à jour
    expect(mockDOMElements['tags-container'].appendChild).toHaveBeenCalled();
  });

  it('devrait gérer la pagination', async () => {
    // Importer le script
    require('../assets/js/script.js');

    // Simuler l'événement DOMContentLoaded
    const loadEvent = new Event('DOMContentLoaded');
    document.dispatchEvent(loadEvent);

    // Attendre que le fetch soit résolu
    await new Promise(resolve => setTimeout(resolve, 0));

    // Simuler un clic sur le bouton suivant
    const nextPageButton = mockDOMElements['next-page'];
    nextPageButton.dispatchEvent(new Event('click'));

    // Vérifier que la pagination a été mise à jour
    expect(mockDOMElements['page-info'].textContent).toMatch(/Page \d+ sur \d+/);
  });

  it('devrait gérer la recherche', async () => {
    // Importer le script
    require('../assets/js/script.js');

    // Simuler l'événement DOMContentLoaded
    const loadEvent = new Event('DOMContentLoaded');
    document.dispatchEvent(loadEvent);

    // Attendre que le fetch soit résolu
    await new Promise(resolve => setTimeout(resolve, 0));

    // Simuler une recherche
    const searchBar = mockDOMElements['search-bar'];
    searchBar.value = 'Salade';
    searchBar.dispatchEvent(new Event('input'));

    // Vérifier que les tags de recherche ont été mis à jour
    expect(mockDOMElements['tags-container'].appendChild).toHaveBeenCalled();
  });
});