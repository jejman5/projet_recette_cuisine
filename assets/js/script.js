document.addEventListener('DOMContentLoaded', async () => {
    const searchBar = document.getElementById('search-bar');
    const recipesContainer = document.getElementById('recipes');
    const prevPageButton = document.getElementById('prev-page');
    const nextPageButton = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');
    
    const ingredientFilter = document.getElementById('ingredient-filter');
    const ingredientSearch = document.getElementById('ingredient-search');
    const utensilFilter = document.getElementById('utensil-filter');
    const utensilSearch = document.getElementById('utensil-search');
    const applianceFilter = document.getElementById('appliance-filter');
    const applianceSearch = document.getElementById('appliance-search');
    const tagsContainer = document.getElementById('tags-container');

    let recipes = [];
    let filteredRecipes = [];
    let selectedTags = { ingredients: [], utensils: [], appliances: [], search: [] };
    let currentPage = 1;
    const cardsPerPage = 6;

    // Chargement des données
    try {
        const response = await fetch('assets/recipe.json');
        recipes = await response.json();
        filteredRecipes = recipes;
        
        // Déplacez l'initialisation ici, après avoir chargé les recettes
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

    function populateFilters() {
        const getCurrentlyVisibleRecipes = () => {
            return filteredRecipes.length > 0 ? filteredRecipes : recipes;
        };

        // Fonction pour mettre à jour dynamiquement les filtres
        const dynamicFilterUpdate = () => {
            const visibleRecipes = getCurrentlyVisibleRecipes();

            // Mettre à jour les ingrédients
            const ingredients = [...new Set(
                visibleRecipes.flatMap(recipe => 
                    recipe.ingredients.map(i => i.ingredient)
                )
            )].sort();

            // Mettre à jour les ustensiles
            const utensils = [...new Set(
                visibleRecipes.flatMap(recipe => recipe.ustensils)
            )].sort();

            // Mettre à jour les appareils
            const appliances = [...new Set(
                visibleRecipes.map(recipe => recipe.appliance)
            )].sort();

            // Mettre à jour les filtres
            updateMultiSelect(ingredientFilter, ingredients);
            updateMultiSelect(utensilFilter, utensils);
            updateMultiSelect(applianceFilter, appliances);

            setupFilterSearch(ingredientSearch, ingredientFilter);
            setupFilterSearch(utensilSearch, utensilFilter);
            setupFilterSearch(applianceSearch, applianceFilter);
        };

        // Initialisation des filtres
        const ingredients = [...new Set(
            recipes.flatMap(recipe => recipe.ingredients.map(i => i.ingredient))
        )].sort();
        const utensils = [...new Set(recipes.flatMap(recipe => recipe.ustensils))].sort();
        const appliances = [...new Set(recipes.map(recipe => recipe.appliance))].sort();

        updateMultiSelect(ingredientFilter, ingredients);
        updateMultiSelect(utensilFilter, utensils);
        updateMultiSelect(applianceFilter, appliances);

        setupFilterSearch(ingredientSearch, ingredientFilter);
        setupFilterSearch(utensilSearch, utensilFilter);
        setupFilterSearch(applianceSearch, applianceFilter);

        // Ajouter cette méthode à l'objet global pour pouvoir l'appeler
        window.dynamicFilterUpdate = dynamicFilterUpdate;
    }

    function setupFilterSearch(searchInput, selectElement) {
        searchInput.addEventListener('input', (event) => {
            const searchTerm = event.target.value.toLowerCase();
            Array.from(selectElement.options).forEach(option => {
                const isVisible = option.value.toLowerCase().includes(searchTerm);
                option.style.display = isVisible ? 'block' : 'none';
            });
        });
    }

    function updateMultiSelect(select, options) {
        // Stocker la sélection actuelle
        const currentSelectedValues = Array.from(select.selectedOptions).map(opt => opt.value);
        
        select.innerHTML = '';
        options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option;
            opt.textContent = option;
            
            // Restaurer la sélection précédente si possible
            if (currentSelectedValues.includes(option)) {
                opt.selected = true;
            }
            
            select.appendChild(opt);
        });
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
            const { id } = event.target;
    
            const typeMap = {
                'ingredient-filter': 'ingredients',
                'utensil-filter': 'utensils',
                'appliance-filter': 'appliances'
            };
    
            const type = typeMap[id];
    
            if (!type) {
                console.error(`Type "${id}" non valide. Vérifiez les IDs dans le HTML.`);
                return;
            }
    
            selectedTags[type] = Array.from(event.target.selectedOptions).map(option => option.value);
            updateTagDisplay(type, event.target);
            filterRecipes();
            
            // Mettre à jour dynamiquement les autres filtres
            window.dynamicFilterUpdate();
        });
    });
    

    function addSearchTag(query) {
        if (query.length >= 3) {
            if (!selectedTags.search.includes(query)) {
                selectedTags.search.push(query);
                const tagElement = document.createElement('span');
                tagElement.className = 'tag';
                tagElement.textContent = `"${query}" (recherche)`;
                tagElement.addEventListener('click', () => {
                    selectedTags.search = selectedTags.search.filter(t => t !== query);
                    tagElement.remove();
                    filterRecipes();
                });
                tagsContainer.appendChild(tagElement);
            }
        }
    }

    function updateTagDisplay(type, selectElement) {
        // Supprimer les anciens tags pour ce type
        const existingTags = Array.from(tagsContainer.querySelectorAll(`.tag[data-type="${type}"]`));
        existingTags.forEach(tag => tag.remove());

        // Créer de nouveaux tags
        selectedTags[type].forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag';
            tagElement.dataset.type = type;
            tagElement.textContent = `${tag} (${type})`;
            
            tagElement.addEventListener('click', () => {
                // Trouver et désélectionner l'option correspondante
                if (selectElement) {
                    const options = Array.from(selectElement.options);
                    const optionToDeselect = options.find(opt => opt.value === tag);
                    if (optionToDeselect) {
                        optionToDeselect.selected = false;
                    }
                }

                // Supprimer le tag et mettre à jour les tags sélectionnés
                selectedTags[type] = selectedTags[type].filter(t => t !== tag);
                tagElement.remove();
                filterRecipes();
            });
            
            tagsContainer.appendChild(tagElement);
        });
    }

    // Recherche principale et avancée
    function filterRecipes() {
        filteredRecipes = recipes.filter(recipe => {
            const searchMatches = selectedTags.search.every(query => 
                recipe.name.toLowerCase().includes(query.toLowerCase()) ||
                recipe.description.toLowerCase().includes(query.toLowerCase()) ||
                recipe.ingredients.some(i => i.ingredient.toLowerCase().includes(query.toLowerCase()))
            );

            const tagsMatch = 
                selectedTags.ingredients.every(tag => recipe.ingredients.some(i => i.ingredient === tag)) &&
                selectedTags.utensils.every(tag => recipe.ustensils.includes(tag)) &&
                selectedTags.appliances.every(tag => recipe.appliance === tag);

            return searchMatches && tagsMatch;
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

    let searchTimeout;
    searchBar.addEventListener('input', () => {
        // Clear any existing timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        // Remove all existing search tags
        const oldSearchTags = tagsContainer.querySelectorAll('.tag[data-type="search"]');
        oldSearchTags.forEach(tag => tag.remove());
        selectedTags.search = [];

        // Debounce the search to only trigger after 500ms of no typing
        searchTimeout = setTimeout(() => {
            const query = searchBar.value.trim();
            
            if (query.length >= 3) {
                addSearchTag(query);
                filterRecipes();
            } else if (query.length === 0) {
                // If search bar is empty, reset to show all recipes
                filteredRecipes = recipes;
                currentPage = 1;
                displayRecipes();
            }
        }, 500);
    });
});
