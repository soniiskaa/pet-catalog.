console.log('app.js підключено')

const boardGames = [
    {title: "Каркасон", minPlayers: 2, maxPlayers: 5, img: "assets/karkason.png"},
    {title: "Вибухові кошенята", minPlayers: 2, maxPlayers: 5, img: "assets/vubyhoviKoshenata.png"},
    {title: "Кіклади", minPlayers: 2, maxPlayers: 6, img: "assets/kiklady.png"},
    {title: "Цитаделі", minPlayers: 2, maxPlayers: 8, img: "assets/tsitadeli.jpg"},
    {title: "Брас", minPlayers: 2, maxPlayers: 4, img: "assets/brass.jpg"},
    {title: "Норсгард", minPlayers: 2, maxPlayers: 5, img: "assets/northgard.jpg"},
    {title: "Коуп", minPlayers: 3, maxPlayers: 6, img: "assets/coup.png"},
    {title: "Зараження", minPlayers: 4, maxPlayers: 12, img: "assets/zarazhenya.jpg"},
    {title: "Саботер", minPlayers: 3, maxPlayers: 10, img: "assets/saboter.png"},
    {title: "Орифлама", minPlayers: 3, maxPlayers: 5, img: "assets/oriflama.jpg"},
    {title: "Тераформування Марса", minPlayers: 1, maxPlayers: 5, img: "assets/teraforyvanya.jpg"},
    {title: "Череп", minPlayers: 3, maxPlayers: 6, img: "assets/skull.jpg"}
];

const fitsPlayers = (game, n) => n >= game.minPlayers && n <= game.maxPlayers;

const staticArticles = document.querySelectorAll('#games-list article');
for (const arcticle of staticArticles){
    arcticle.remove();
}

const listContainer = document.querySelector('#games-list');

const countElement = document.querySelector('#games-count');

function renderGames(gamesArray) {
    for (const game of gamesArray) {
        
        // Крок 5: Створювати елемент для кожного запису
        const article = document.createElement('article');
        
        const h3 = document.createElement('h3');
        h3.textContent = game.title;
        
        const p = document.createElement('p');
        p.textContent = `${game.minPlayers}-${game.maxPlayers} гравців`;

        const img = document.createElement('img');
        img.src = game.img;
        img.alt = `Настільна гра ${game.title}`;

        // Крок 6: Додати атрибут і умовний клас
        // Встановлюємо атрибут data-players
        article.setAttribute('data-players', `${game.minPlayers}-${game.maxPlayers}`);
        
        // Якщо гра підходить для 4 гравців, додаємо клас fits
        if (fitsPlayers(game, 4)) {
            article.classList.add('fits');
        }

        // Вкладаємо всі дрібні елементи всередину article
        article.append(img, h3, p);

        // Крок 7: Додати елемент у контейнер
        listContainer.append(article);
    }

    // Крок 9: Оновити підсумковий елемент поза списком
    if (countElement) {
        countElement.textContent = `Усього ігор у списку: ${gamesArray.length}`;
    }
}

renderGames(boardGames);

