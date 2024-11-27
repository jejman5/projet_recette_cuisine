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

        const dynamicFilterUpdate = () => {
            const visibleRecipes = getCurrentlyVisibleRecipes();

            const ingredients = [...new Set(
                visibleRecipes.flatMap(recipe => 
                    recipe.ingredients.map(i => i.ingredient)
                )
            )].sort();

            const utensils = [...new Set(
                visibleRecipes.flatMap(recipe => recipe.ustensils)
            )].sort();

            const appliances = [...new Set(
                visibleRecipes.map(recipe => recipe.appliance)
            )].sort();

            updateMultiSelect('ingredient-filter', ingredients);
            updateMultiSelect('utensil-filter', utensils);
            updateMultiSelect('appliance-filter', appliances);

            setupFilterSearch('ingredient-search', 'ingredient-filter');
            setupFilterSearch('utensil-search', 'utensil-filter');
            setupFilterSearch('appliance-search', 'appliance-filter');
        };

        const ingredients = [...new Set(
            recipes.flatMap(recipe => recipe.ingredients.map(i => i.ingredient))
        )].sort();
        const utensils = [...new Set(recipes.flatMap(recipe => recipe.ustensils))].sort();
        const appliances = [...new Set(recipes.map(recipe => recipe.appliance))].sort();

        updateMultiSelect('ingredient-filter', ingredients);
        updateMultiSelect('utensil-filter', utensils);
        updateMultiSelect('appliance-filter', appliances);

        setupFilterSearch('ingredient-search', 'ingredient-filter');
        setupFilterSearch('utensil-search', 'utensil-filter');
        setupFilterSearch('appliance-search', 'appliance-filter');

        // Configuration des événements pour les nouveaux filtres
        setupMultiSelectEvents('ingredient-filter');
        setupMultiSelectEvents('utensil-filter');
        setupMultiSelectEvents('appliance-filter');

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

    function setupMultiSelectEvents(filterId) {
        const container = document.getElementById(filterId);
        
        container.addEventListener('change', (event) => {
            if (event.target.type === 'checkbox') {
                const typeMap = {
                    'ingredient-filter': 'ingredients',
                    'utensil-filter': 'utensils',
                    'appliance-filter': 'appliances'
                };

                const type = typeMap[filterId];
                selectedTags[type] = Array.from(
                    container.querySelectorAll('input:checked')
                ).map(checkbox => checkbox.value);

                updateTagDisplay(type, container);
                filterRecipes();
                
                // Mettre à jour dynamiquement les autres filtres
                window.dynamicFilterUpdate();
            }
        });
    }

    function updateMultiSelect(filterId, options) {
        const container = document.getElementById(filterId);
        container.innerHTML = ''; // Vider le conteneur

        options.forEach(option => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'multi-select-option';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `${filterId}-${option}`;
            checkbox.value = option;

            const label = document.createElement('label');
            label.htmlFor = `${filterId}-${option}`;
            label.textContent = option;

            optionDiv.appendChild(checkbox);
            optionDiv.appendChild(label);
            container.appendChild(optionDiv);
        });
    }

    function setupFilterSearch(searchInputId, filterId) {
        const searchInput = document.getElementById(searchInputId);
        const container = document.getElementById(filterId);

        searchInput.addEventListener('input', (event) => {
            const searchTerm = event.target.value.toLowerCase();
            
            const options = container.querySelectorAll('.multi-select-option');
            options.forEach(option => {
                const label = option.querySelector('label');
                const isVisible = label.textContent.toLowerCase().includes(searchTerm);
                option.style.display = isVisible ? 'flex' : 'none';
            });
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
            // Vérifiez que l'événement vient d'une case à cocher
            if (event.target.type === 'checkbox') {
                const containerElement = event.target.closest('.multi-select');
                const containerId = containerElement.id;
        
                const typeMap = {
                    'ingredient-filter': 'ingredients',
                    'utensil-filter': 'utensils',
                    'appliance-filter': 'appliances'
                };
        
                const type = typeMap[containerId];
        
                if (!type) {
                    console.error(`Type "${containerId}" non valide. Vérifiez les IDs dans le HTML.`);
                    return;
                }
        
                const selectedValues = Array.from(
                    containerElement.querySelectorAll('input:checked')
                ).map(checkbox => checkbox.value);
        
                selectedTags[type] = selectedValues;
                updateTagDisplay(type, containerElement);
                filterRecipes();
                
                // Mettre à jour dynamiquement les autres filtres
                window.dynamicFilterUpdate();
            }
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

    function updateTagDisplay(type, filterContainer) {
        // Supprimer les anciens tags pour ce type
        const existingTags = Array.from(tagsContainer.querySelectorAll(`.tag[data-type="${type}"]`));
        existingTags.forEach(tag => tag.remove());
    
        // Trouver toutes les cases cochées dans le conteneur
        const checkedBoxes = filterContainer.querySelectorAll('input:checked');
        const selectedTags = Array.from(checkedBoxes).map(checkbox => checkbox.value);
    
        // Créer des tags pour chaque option cochée
        selectedTags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag';
            tagElement.dataset.type = type;
            tagElement.textContent = `${tag} (${type})`;
            
            tagElement.addEventListener('click', () => {
                // Trouver et décocher la case correspondante
                const checkbox = filterContainer.querySelector(`input[value="${tag}"]`);
                if (checkbox) {
                    checkbox.checked = false;
                }
    
                // Supprimer le tag et mettre à jour les tags sélectionnés
                selectedTags.splice(selectedTags.indexOf(tag), 1);
                tagElement.remove();
                filterRecipes();
                
                // Mettre à jour dynamiquement les autres filtres
                window.dynamicFilterUpdate();
            });
            
            tagsContainer.appendChild(tagElement);
        });
    
        // Mettre à jour l'objet selectedTags global
        switch(type) {
            case 'ingredients':
                selectedTags.ingredients = selectedTags;
                break;
            case 'utensils':
                selectedTags.utensils = selectedTags;
                break;
            case 'appliances':
                selectedTags.appliances = selectedTags;
                break;
        }
    }

    // Recherche principale et avancée
    function filterRecipes() {
        // Récupérer les tags sélectionnés
        const selectedIngredients = Array.from(
            document.querySelectorAll('#ingredient-filter input:checked')
        ).map(input => input.value);
    
        const selectedUtensils = Array.from(
            document.querySelectorAll('#utensil-filter input:checked')
        ).map(input => input.value);
    
        const selectedAppliances = Array.from(
            document.querySelectorAll('#appliance-filter input:checked')
        ).map(input => input.value);
    
        const searchTerm = searchBar.value.trim().toLowerCase();
    
        // Filtrer les recettes
        filteredRecipes = recipes.filter(recipe => {
            // Filtre par ingrédients (au moins un des tags sélectionnés)
            const ingredientMatch = selectedIngredients.length === 0 || 
                selectedIngredients.some(ing => 
                    recipe.ingredients.some(r => r.ingredient === ing)
                );
    
            // Filtre par ustensiles (tous les tags sélectionnés doivent être présents)
            const utensilMatch = selectedUtensils.length === 0 || 
                selectedUtensils.every(utensil => 
                    recipe.ustensils.includes(utensil)
                );
    
            // Filtre par appareil
            const applianceMatch = selectedAppliances.length === 0 || 
                selectedAppliances.includes(recipe.appliance);
    
            // Filtre par recherche
            const searchMatch = !searchTerm || 
                recipe.name.toLowerCase().includes(searchTerm) ||
                recipe.description.toLowerCase().includes(searchTerm) ||
                recipe.ingredients.some(ing => 
                    ing.ingredient.toLowerCase().includes(searchTerm)
                );
    
            return ingredientMatch && utensilMatch && applianceMatch && searchMatch;
        });
    
        // Réinitialiser à la première page
        currentPage = 1;
        displayRecipes();
    }

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
