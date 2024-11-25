document.addEventListener('DOMContentLoaded', async () => {
    const searchBar = document.getElementById('search-bar');
    const recipesContainer = document.getElementById('recipes');
    const prevPageButton = document.getElementById('prev-page');
    const nextPageButton = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');
    const ingredientFilter = document.getElementById('ingredient-filter');
    const utensilFilter = document.getElementById('utensil-filter');
    const applianceFilter = document.getElementById('appliance-filter');
    const tagsContainer = document.getElementById('tags-container');

    let recipes = [];
    let filteredRecipes = [];
    let selectedTags = { ingredients: [], utensils: [], appliances: [] };
    let currentPage = 1;
    const cardsPerPage = 6;

    // Chargement des données
    try {
        const response = await fetch('assets/recipe.json');
        recipes = await response.json();
        filteredRecipes = recipes;
        populateFilters();
        updatePagination();
        displayRecipes();
    } catch (error) {
        console.error("Erreur de chargement des recettes :", error);
    }

    // Mise à jour des recettes affichées
    function displayRecipes() {
        recipesContainer.innerHTML = '';

        const startIndex = (currentPage - 1) * cardsPerPage;
        const endIndex = startIndex + cardsPerPage;
        const paginatedRecipes = filteredRecipes.slice(startIndex, endIndex);

        paginatedRecipes.forEach(recipe => {
            const recipeCard = document.createElement('div');
            recipeCard.classList.add('recipe-card');
            recipeCard.innerHTML = `
                <div class="image-container">
                <img src="assets/images/${recipe.image}" alt="${recipe.name}" class="recipe-image">
                </div>
                <div class="recipe-details">
                    <h3>${recipe.name}</h3>
                    <p class="recipe-time"><i class="fas fa-clock"></i> ${recipe.time} min</p>
                    <p class="recipe-description">${recipe.description}</p>
                    <h4>Ingrédients</h4>
                    <ul class="ingredients-list">
                        ${recipe.ingredients.map(ing => `
                            <li>
                                ${ing.ingredient} ${ing.quantity ? `- ${ing.quantity} ${ing.unit || ''}` : ''}
                            </li>
                        `).join('')}
                    </ul>
                    <h4>Ustensiles</h4>
                    <ul class="ustensils-list">
                        ${recipe.ustensils.map(utensil => `<li>${utensil}</li>`).join('')}
                    </ul>
                    <h4>Appareil</h4>
                    <p>${recipe.appliance}</p>
                </div>
            `;
            recipesContainer.appendChild(recipeCard);
        });

        updatePagination();
    }

    // Gestion des filtres avancés
    function populateFilters() {
        const unique = (arr) => [...new Set(arr)].sort();
        const ingredients = unique(recipes.flatMap(recipe => recipe.ingredients.map(i => i.ingredient)));
        const utensils = unique(recipes.flatMap(recipe => recipe.ustensils));
        const appliances = unique(recipes.map(recipe => recipe.appliance));

        updateSelect(ingredientFilter, ingredients);
        updateSelect(utensilFilter, utensils);
        updateSelect(applianceFilter, appliances);
    }

    function updateSelect(select, options) {
        select.innerHTML = `<option value="">Tous</option>`;
        options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option;
            opt.textContent = option;
            select.appendChild(opt);
        });
    }

    // Gestion des événements pour les filtres
    [ingredientFilter, utensilFilter, applianceFilter].forEach(filter => {
        filter.addEventListener('change', (event) => {
            const { id, value } = event.target;
            const type = id.replace('-filter', '');
            if (value && !selectedTags[type].includes(value)) {
                selectedTags[type].push(value);
                addTag(value, type);
                filterRecipes();
            }
        });
    });

    // Ajout d'un tag
    function addTag(tag, type) {
        const tagElement = document.createElement('span');
        tagElement.className = 'tag';
        tagElement.textContent = `${tag} (${type})`;
        tagElement.addEventListener('click', () => {
            // Supprimer le tag
            selectedTags[type] = selectedTags[type].filter(t => t !== tag);
            tagElement.remove();
            filterRecipes();
        });
        tagsContainer.appendChild(tagElement);
    }

    // Recherche principale et avancée
    function filterRecipes() {
        const query = searchBar.value.toLowerCase();
        filteredRecipes = recipes.filter(recipe => {
            const matchesQuery = query.length < 3 || 
                recipe.name.toLowerCase().includes(query) ||
                recipe.description.toLowerCase().includes(query) ||
                recipe.ingredients.some(i => i.ingredient.toLowerCase().includes(query));

            const matchesTags = selectedTags.ingredients.every(tag => recipe.ingredients.some(i => i.ingredient === tag)) &&
                selectedTags.utensils.every(tag => recipe.ustensils.includes(tag)) &&
                selectedTags.appliances.every(tag => recipe.appliance === tag);

            return matchesQuery && matchesTags;
        });
        currentPage = 1;
        displayRecipes();
    }

    // Gestion des événements pour les boutons de pagination
    prevPageButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayRecipes();
        }
    });

    nextPageButton.addEventListener('click', () => {
        const maxPage = Math.ceil(filteredRecipes.length / cardsPerPage);
        if (currentPage < maxPage) {
            currentPage++;
            displayRecipes();
        }
    });

    function updatePagination() {
        const maxPage = Math.ceil(filteredRecipes.length / cardsPerPage);
        pageInfo.textContent = `Page ${currentPage} sur ${maxPage}`;
        prevPageButton.disabled = currentPage === 1;
        nextPageButton.disabled = currentPage === maxPage;
    }

    searchBar.addEventListener('input', () => {
        filterRecipes();
    });
});
