document.addEventListener('DOMContentLoaded', async () => {
    const searchBar = document.getElementById('search-bar');
    const recipesContainer = document.getElementById('recipes');
    const prevPageButton = document.getElementById('prev-page');
    const nextPageButton = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');

    let recipes = [];
    let filteredRecipes = [];
    let currentPage = 1;
    const cardsPerPage = 6;

    // Chargement des données
    try {
        const response = await fetch('assets/recipe.json');
        recipes = await response.json();
        filteredRecipes = recipes;
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

        updatePagination(); // Mets à jour les informations de pagination
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

    // Mise à jour de la pagination (activation/désactivation des boutons et infos)
    function updatePagination() {
        const maxPage = Math.ceil(filteredRecipes.length / cardsPerPage);
        pageInfo.textContent = `Page ${currentPage} sur ${maxPage}`;
        prevPageButton.disabled = currentPage === 1;
        nextPageButton.disabled = currentPage === maxPage;
    }

    // Recherche principale
    searchBar.addEventListener('input', (event) => {
        const query = event.target.value.toLowerCase();
        if (query.length >= 3) {
            filteredRecipes = recipes.filter(recipe => 
                recipe.name.toLowerCase().includes(query) ||
                recipe.description.toLowerCase().includes(query) ||
                recipe.ingredients.some(ing => ing.ingredient.toLowerCase().includes(query))
            );
        } else {
            filteredRecipes = recipes;
        }
        currentPage = 1; // Réinitialise à la première page
        displayRecipes();
    });
});
