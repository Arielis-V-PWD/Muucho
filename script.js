let currentLang = 'en';

// Load saved language from localStorage
const savedLang = localStorage.getItem('muuchoLang');
if (savedLang) {
    currentLang = savedLang;
}

// Wait until DOM is fully loaded
window.addEventListener('DOMContentLoaded', () => {
    const langToggle = document.getElementById('lang-toggle');
    langToggle.textContent = currentLang === 'en' ? 'ES' : 'EN';

    langToggle.addEventListener('click', () => {
        currentLang = currentLang === 'en' ? 'es' : 'en';
        localStorage.setItem('muuchoLang', currentLang);
        langToggle.textContent = currentLang === 'en' ? 'ES' : 'EN';
        fetch('translations.json')
            .then(res => res.json())
            .then(translations => applyTranslations(translations[currentLang]));
    });

    // Initial translation load
    fetch('translations.json')
        .then(res => res.json())
        .then(translations => applyTranslations(translations[currentLang]));
});

// translate and apply text content
function applyTranslations(data) {
    // Nav
    document.getElementById('nav-home').textContent = data.nav.home;
    document.getElementById('nav-option1').textContent = data.nav.option1;
    document.getElementById('nav-option2').textContent = data.nav.option2;

    // Home description
    document.getElementById('home-desc').textContent = data.home.description;

    // Footer
    document.getElementById('footer-tagline').textContent = data.footer.tagline;
    document.getElementById('footer-about').textContent = data.footer.links.about;
    document.getElementById('footer-contact').textContent = data.footer.links.contact;
    document.getElementById('footer-privacy').textContent = data.footer.links.privacy;
    document.getElementById('footer-terms').textContent = data.footer.links.terms;

    // Country grid
    const grid = document.getElementById('country-grid');
    grid.innerHTML = '';
    fetch('countries.json')
        .then(res => res.json())
        .then(countries => {
            countries.forEach((item, index) => {
                const div = document.createElement('div');
                div.className = 'grid-item';
                div.innerHTML = `
          <a href="${item.link}">
            <img src="${item.image}" alt="${data.countries[index]}">
          </a>
          <p>${data.countries[index]}</p>
        `;
                grid.appendChild(div);
            });
        });
}
