console.log('app.js підключено')

const boardGames = [
    {title: "Каркасон", minPlayers: 2, maxPlayers: 5, genre: "cards", img: "assets/karkason.png"},
    {title: "Вибухові кошенята", minPlayers: 2, maxPlayers: 5, genre: "cards", img: "assets/vubyhoviKoshenata.png"},
    {title: "Кіклади", minPlayers: 2, maxPlayers: 6, genre: "strategy", img: "assets/kiklady.png"},
    {title: "Цитаделі", minPlayers: 2, maxPlayers: 8, genre: "cards", img: "assets/tsitadeli.jpg"},
    {title: "Брас", minPlayers: 2, maxPlayers: 4, genre: "euro", img: "assets/brass.jpg"},
    {title: "Норсгард", minPlayers: 2, maxPlayers: 5, genre: "strategy", img: "assets/northgard.jpg"},
    {title: "Коуп", minPlayers: 3, maxPlayers: 6, genre: "party", img: "assets/coup.png"},
    {title: "Зараження", minPlayers: 4, maxPlayers: 12, genre: "cooperat", img: "assets/zarazhenya.jpg"},
    {title: "Саботер", minPlayers: 3, maxPlayers: 10, genre: "party", img: "assets/saboter.png"},
    {title: "Орифлама", minPlayers: 3, maxPlayers: 5, genre: "cards", img: "assets/oriflama.jpg"},
    {title: "Тераформування Марса", minPlayers: 1, genre: "euro", maxPlayers: 5, img: "assets/teraforyvanya.jpg"},
    {title: "Череп", minPlayers: 3, maxPlayers: 6, genre: "party", img: "assets/skull.jpg"}
];
const fitsPlayers = (game, n) => n >= game.minPlayers && n <= game.maxPlayers;

const listContainer = document.querySelector('#games-list');
const countElement = document.querySelector('#games-count');

function renderGames(gamesArray) {
    listContainer.innerHTML = '';

    const genreNames = {
        strategy: "Стратегія",
        euro: "Євро",
        cards: "Карткові ігри",
        cooperat: "Кооперативні ігри",
        party: "Партійні ігри"
    };

    for (const game of gamesArray) {
        const article = document.createElement('article');
        
        const h3 = document.createElement('h3');
        h3.textContent = game.title;
        
        const pPlayers = document.createElement('p');
        pPlayers.textContent = `${game.minPlayers}-${game.maxPlayers} гравців`;

        const pGenre = document.createElement('p');
        pGenre.textContent = `Жанр: ${genreNames[game.genre] || "Не вказано"}`;
        pGenre.style.fontStyle = "italic";
        pGenre.style.margin = "0 0 10px 0";

        const img = document.createElement('img');
        img.src = game.img;
        img.alt = `Настільна гра ${game.title}`;

        const pCompleted = document.createElement('p');
        if(game.completed !== undefined){
            pCompleted.textContent = game.completed ? "Вже зіграно" : "Ще не грали";
            pCompleted.style.fontWeight = "bold";
            pCompleted.style.color = game.completed ? "#27ae60" : "#c0392b";
            pCompleted.style.margin = "0 0 10px 0";
        }

        article.setAttribute('data-players', `${game.minPlayers}-${game.maxPlayers}`);
        
        if (fitsPlayers(game, 4)) {
            article.classList.add('fits');
        }

        article.append(img, h3, pCompleted, pGenre, pPlayers);
        listContainer.append(article);
    }

    if (countElement) {
        countElement.textContent = `Усього ігор у списку: ${gamesArray.length}`;
    }
}

renderGames(boardGames);

const form = document.querySelector('#add-game-form');
const errorElement = document.querySelector('#form-error');
const minInput = document.querySelector('#game-min');
const maxInput = document.querySelector('#game-max');

const validatePlayers = () => {
    const min = Number(minInput.value);
    const max = Number(maxInput.value);
    
    if (min > max && minInput.value !== '' && maxInput.value !== '') {
        errorElement.textContent = 'Помилка: мінімальна кількість гравців не може перевищувати максимальну!';
        return false;
    } else {
        errorElement.textContent = '';
        return true;
    }
};

minInput.addEventListener('input', validatePlayers);
maxInput.addEventListener('input', validatePlayers);

form.addEventListener('submit', (event) => {
    event.preventDefault(); 

    if (!validatePlayers()) return; 

    const title = document.querySelector('#game-title').value;
    const minPlayers = Number(minInput.value);
    const maxPlayers = Number(maxInput.value);
    const genre = document.querySelector('#game-genre').value;

    const newGame = {
        title: title,
        minPlayers: minPlayers,
        maxPlayers: maxPlayers,
        genre: genre,
        img: "assets/brass.jpg"
    };
    boardGames.push(newGame); 
    
    form.reset();
    errorElement.textContent = '';
    
    applyFilters(); 
});

const searchInput = document.querySelector('#search-input');
const playerSelect = document.querySelector('#player-filter');
const genreSelect = document.querySelector('#genre-filter');

function applyFilters() {
    const searchText = searchInput.value.toLowerCase();
    const playersValue = playerSelect.value;
    const genreValue = genreSelect.value;

    const filteredGames = boardGames.filter(game => {
        const matchesSearch = game.title.toLowerCase().includes(searchText);
        const matchesPlayers = playersValue === 'all' || fitsPlayers(game, Number(playersValue));
        const matchesGenre = genreValue === 'all' || game.genre === genreValue;

        return matchesSearch && matchesPlayers && matchesGenre;
    });

    renderGames(filteredGames);
}

searchInput.addEventListener('input', applyFilters);
playerSelect.addEventListener('change', applyFilters);
genreSelect.addEventListener('change', applyFilters);

const API_URL = 'https://jsonplaceholder.typicode.com/todos?userId=1';

async function loadData() {
    const loader = document.querySelector('#loading-indicator');
    const errorElement = document.querySelector('#api-error');

    if(loader){
        loader.style.display = 'block';
    }

    if(errorElement) errorElement.style.display = 'none';
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`Помилка HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log("Дані з АРІ:", data);

        const apiGames = data.map(item =>{
            return{
                title: item.title,
                completed: item.completed,
                minPlayers: 2,
                maxPlayers: 5,
                genre: "party",
                img: "assets/"
            }
        });
        const combinedGames = [...boardGames, ...apiGames];
        renderGames(combinedGames);

    } catch (error) {
        console.error("Технічні деталі помилки завантаження:", error);

        if(errorElement){
            errorElement.textContent = "Не вдалося завантажити дані! Перевірте підключення до інтернету!"
            errorElement.style.display = 'block';
        }
    } finally{
        if(loader){
            loader.style.display = 'none';
        }
    }
}

const loadBtn = document.querySelector('#load-api-btn');
if (loadBtn) {
    loadBtn.addEventListener('click', loadData);
}

