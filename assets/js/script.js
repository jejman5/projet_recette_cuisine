document.addEventListener('DOMContentLoaded', async () => {
    const searchBar = document.getElementById('search-bar');
    const recipesContainer = document.getElementById('recipes');
    let recipes = [];

    // Chargement des données de recettes
    try {
        const response = await fetch('assets/recipe.json');
        recipes = await response.json();
        displayRecipes(recipes); // Affiche toutes les recettes au début
    } catch (error) {
        console.error("Erreur de chargement des recettes :", error);
    }

    searchBar.addEventListener('input', (event) => {
        const query = event.target.value.toLowerCase();
        const filteredRecipes = recipes.filter(recipe => 
            recipe.title.toLowerCase().includes(query) ||
            recipe.ingredients.some(ingredient => ingredient.toLowerCase().includes(query))
        );
        displayRecipes(filteredRecipes);
    });
});

function displayRecipes(recipes) {
    const recipesContainer = document.getElementById('recipes');
    recipesContainer.innerHTML = ''; // Efface les recettes actuelles

    recipes.forEach(recipe => {
        const recipeCard = document.createElement('div');
        recipeCard.classList.add('recipe-card');
        
        recipeCard.innerHTML = `
            <div class="image-container">
                <img src="assets/images/${recipe.image}" alt="${recipe.name}" class="recipe-image">
            </div>
            <h3>${recipe.name}</h3>
        `;

        recipesContainer.appendChild(recipeCard);
    });
}

