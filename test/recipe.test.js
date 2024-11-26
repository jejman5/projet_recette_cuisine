// recipe.test.js
import '@testing-library/jest-dom';

// Mock des données de test
const mockRecipes = [
  {
    name: "Poulet rôti",
    description: "Délicieux poulet rôti aux herbes",
    time: 90,
    ingredients: [
      { ingredient: "Poulet", quantity: 1, unit: "entier" },
      { ingredient: "Thym", quantity: 2, unit: "branches" }
    ],
    ustensils: ["Plat", "Four"],
    appliance: "Four"
  },
  {
    name: "Pâtes carbonara",
    description: "Pâtes à la carbonara traditionnelles",
    time: 25,
    ingredients: [
      { ingredient: "Pâtes", quantity: 500, unit: "g" },
      { ingredient: "Lardons", quantity: 200, unit: "g" }
    ],
    ustensils: ["Casserole", "Poêle"],
    appliance: "Plaque de cuisson"
  }
];

// Mock du DOM
document.body.innerHTML = `
  <input id="search-bar" />
  <div id="recipes"></div>
  <div id="tags-container"></div>
  <select id="ingredient-filter"></select>
  <select id="utensil-filter"></select>
  <select id="appliance-filter"></select>
  <button id="prev-page"></button>
  <button id="next-page"></button>
  <span id="page-info"></span>
`;

// Tests pour la fonction filterRecipes
describe('Filtrage des recettes', () => {
  let selectedTags;
  let filteredRecipes;
  
  beforeEach(() => {
    selectedTags = { ingredients: [], utensils: [], appliances: [] };
    filteredRecipes = [...mockRecipes];
    document.getElementById('search-bar').value = '';
  });

  test('Recherche par nom de recette', () => {
    document.getElementById('search-bar').value = 'poulet';
    const filtered = filterRecipes(mockRecipes, selectedTags, document.getElementById('search-bar').value);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe('Poulet rôti');
  });

  test('Recherche avec moins de 3 caractères', () => {
    document.getElementById('search-bar').value = 'po';
    const filtered = filterRecipes(mockRecipes, selectedTags, document.getElementById('search-bar').value);
    expect(filtered).toEqual(mockRecipes);
  });

  test('Filtrage par ingrédient', () => {
    selectedTags.ingredients = ['Poulet'];
    const filtered = filterRecipes(mockRecipes, selectedTags, '');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe('Poulet rôti');
  });

  test('Filtrage par ustensile', () => {
    selectedTags.utensils = ['Casserole'];
    const filtered = filterRecipes(mockRecipes, selectedTags, '');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe('Pâtes carbonara');
  });

  test('Filtrage par appareil', () => {
    selectedTags.appliances = ['Four'];
    const filtered = filterRecipes(mockRecipes, selectedTags, '');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe('Poulet rôti');
  });

  test('Filtrage combiné (recherche + tags)', () => {
    document.getElementById('search-bar').value = 'poulet';
    selectedTags.appliances = ['Four'];
    const filtered = filterRecipes(mockRecipes, selectedTags, document.getElementById('search-bar').value);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe('Poulet rôti');
  });
});

// Tests pour la pagination
describe('Pagination', () => {
  const cardsPerPage = 6;
  
  test('Calcul correct du nombre total de pages', () => {
    expect(Math.ceil(mockRecipes.length / cardsPerPage)).toBe(1);
  });

  test('Pagination avec liste vide', () => {
    const empty = [];
    expect(Math.ceil(empty.length / cardsPerPage)).toBe(0);
  });
});

// Tests pour la gestion des tags
describe('Gestion des tags', () => {
  let tagsContainer;
  
  beforeEach(() => {
    tagsContainer = document.getElementById('tags-container');
    tagsContainer.innerHTML = '';
  });

  test('Ajout dun tag', () => {
    addTag('Poulet', 'ingredients');
    expect(tagsContainer.children).toHaveLength(1);
    expect(tagsContainer.firstChild.textContent).toBe('Poulet (ingredients)');
  });

  test('Suppression dun tag', () => {
    addTag('Poulet', 'ingredients');
    const tag = tagsContainer.firstChild;
    tag.click();
    expect(tagsContainer.children).toHaveLength(0);
  });

  test('Ajout de tags multiples', () => {
    addTag('Poulet', 'ingredients');
    addTag('Four', 'appliances');
    expect(tagsContainer.children).toHaveLength(2);
  });
});

// Tests pour les filtres avancés
describe('Filtres avancés', () => {
  test('Population des listes de filtres', () => {
    populateFilters(mockRecipes);
    const ingredientFilter = document.getElementById('ingredient-filter');
    const utensilFilter = document.getElementById('utensil-filter');
    const applianceFilter = document.getElementById('appliance-filter');

    // +1 pour l'option "Tous" par défaut
    expect(ingredientFilter.options.length).toBe(3); // Poulet, Thym + "Tous"
    expect(utensilFilter.options.length).toBe(5); // Plat, Four, Casserole, Poêle + "Tous"
    expect(applianceFilter.options.length).toBe(3); // Four, Plaque de cuisson + "Tous"
  });
});

// Fonction helper pour les tests
function populateFilters(recipes) {
  const unique = (arr) => [...new Set(arr)].sort();
  const ingredients = unique(recipes.flatMap(recipe => recipe.ingredients.map(i => i.ingredient)));
  const utensils = unique(recipes.flatMap(recipe => recipe.ustensils));
  const appliances = unique(recipes.map(recipe => recipe.appliance));

  const ingredientFilter = document.getElementById('ingredient-filter');
  const utensilFilter = document.getElementById('utensil-filter');
  const applianceFilter = document.getElementById('appliance-filter');

  [
    { select: ingredientFilter, options: ingredients },
    { select: utensilFilter, options: utensils },
    { select: applianceFilter, options: appliances }
  ].forEach(({ select, options }) => {
    select.innerHTML = '<option value="">Tous</option>';
    options.forEach(option => {
      const opt = document.createElement('option');
      opt.value = option;
      opt.textContent = option;
      select.appendChild(opt);
    });
  });
}

function filterRecipes(recipes, selectedTags, query) {
  return recipes.filter(recipe => {
    const matchesQuery = query.length < 3 || 
      recipe.name.toLowerCase().includes(query.toLowerCase()) ||
      recipe.description.toLowerCase().includes(query.toLowerCase()) ||
      recipe.ingredients.some(i => i.ingredient.toLowerCase().includes(query.toLowerCase()));

    const matchesTags = selectedTags.ingredients.every(tag => recipe.ingredients.some(i => i.ingredient === tag)) &&
      selectedTags.utensils.every(tag => recipe.ustensils.includes(tag)) &&
      selectedTags.appliances.every(tag => recipe.appliance === tag);

    return matchesQuery && matchesTags;
  });
}

function addTag(tag, type) {
  const tagElement = document.createElement('span');
  tagElement.className = 'tag';
  tagElement.textContent = `${tag} (${type})`;
  tagElement.addEventListener('click', () => {
    tagElement.remove();
  });
  document.getElementById('tags-container').appendChild(tagElement);
}