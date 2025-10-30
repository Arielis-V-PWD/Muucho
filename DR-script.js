let allRecipes = [];
let favorites = JSON.parse(localStorage.getItem('muuchoFavorites')) || [];
let activeFilter = '';
let favoritesOnly = false;
let currentLang = localStorage.getItem('muuchoLang') || 'en';
let translations = {};

// Load translations and recipes
Promise.all([
    fetch('DR-translations.json').then(res => res.json()),
    fetch('DR-recipes.json').then(res => res.json())
]).then(([transData, recipeData]) => {
    translations = transData;
    allRecipes = recipeData;
    applyTranslations(translations[currentLang]);
    renderRecipes();

    const langToggle = document.getElementById('lang-toggle');
    langToggle.textContent = currentLang === 'en' ? 'ES' : 'EN';
    langToggle.addEventListener('click', () => {
        currentLang = currentLang === 'en' ? 'es' : 'en';
        localStorage.setItem('muuchoLang', currentLang);
        langToggle.textContent = currentLang === 'en' ? 'ES' : 'EN';
        applyTranslations(translations[currentLang]);
        renderRecipes();
    });
});

// Apply translations to UI
function applyTranslations(data) {
    document.getElementById('country-desc').textContent = data.description;
    const filterMap = { appetizer: '🥟', main: '🍽️', dessert: '🍰', snack: '🍿', drink: '🍹' };

    Object.entries(filterMap).forEach(([type, emoji]) => {
        const btn = document.querySelector(`.filter-btn[data-type="${type}"]`);
        if (btn) btn.textContent = `${emoji} ${data.filters[type]}`;
    });

    document.getElementById('favorites-filter').textContent = `💖 ${data.filters.favorites}`;
    document.getElementById('recipe-search').placeholder = data.filters.search;
}

// Render recipes
function renderRecipes(query = '') {
    const grid = document.getElementById('recipe-grid');
    grid.innerHTML = '';
    const langData = translations[currentLang];

    let filtered = allRecipes;
    if (activeFilter) filtered = filtered.filter(r => r.type === activeFilter);
    if (favoritesOnly) filtered = filtered.filter(r => favorites.includes(r.name));
    if (query) {
        const q = query.toLowerCase();
        filtered = filtered.filter(r =>
            r.name.toLowerCase().includes(q) ||
            r.description[currentLang]?.toLowerCase().includes(q)
        );
    }

    filtered.forEach(recipe => grid.appendChild(createCard(recipe, langData)));
}

// Create recipe card
function createCard(recipe, langData) {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.innerHTML = `
    <img src="${recipe.image}" alt="${recipe.name}" />
    <p><strong>${recipe.name}</strong></p>
    <p>${recipe.description[currentLang]}</p>
  `;

    const favButton = document.createElement('button');
    favButton.className = 'fav-btn';
    favButton.textContent = favorites.includes(recipe.name)
        ? langData.favorites.added
        : langData.favorites.add;
    if (favorites.includes(recipe.name)) favButton.classList.add('favorited');

    favButton.addEventListener('click', () => {
        toggleFavorite(recipe.name, favButton, langData);
        renderRecipes(document.getElementById('recipe-search').value);
    });

    card.appendChild(favButton);
    return card;
}

// Toggle favorite
function toggleFavorite(name, button, langData) {
    const isFav = favorites.includes(name);
    favorites = isFav ? favorites.filter(n => n !== name) : [...favorites, name];
    button.textContent = isFav ? langData.favorites.add : langData.favorites.added;
    button.classList.toggle('favorited', !isFav);
    localStorage.setItem('muuchoFavorites', JSON.stringify(favorites));
}

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const type = btn.dataset.type;
        const isFavBtn = btn.id === 'favorites-filter';

        favoritesOnly = isFavBtn ? !favoritesOnly : false;
        activeFilter = isFavBtn ? '' : (activeFilter === type ? '' : type);

        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        if (isFavBtn && favoritesOnly) btn.classList.add('active');
        else if (!isFavBtn && activeFilter) btn.classList.add('active');

        document.getElementById('recipe-search').value = '';
        renderRecipes();
    });
});

// Search bar
document.getElementById('recipe-search').addEventListener('input', e => {
    renderRecipes(e.target.value);
});
