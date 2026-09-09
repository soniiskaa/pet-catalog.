console.log('app.js підключено')

const boardGames = [
    {title: "Каркасон", minPlayers: 2, maxPlayers: 5},
    {title: "Вибухові кошенята", minPlayers: 2, maxPlayers: 5},
    {title: "Кіклади", minPlayers: 2, maxPlayers: 6},
    {title: "Цитаделі", minPlayers: 2, maxPlayers: 8},
    {title: "Брас", minPlayers: 2, maxPlayers: 4},
    {title: "Норсгард", minPlayers: 2, maxPlayers: 5},
    {title: "Коуп", minPlayers: 3, maxPlayers: 6},
    {title: "Зараження", minPlayers: 4, maxPlayers: 12},
    {title: "Саботер", minPlayers: 3, maxPlayers: 10},
    {title: "Орифлама", minPlayers: 3, maxPlayers: 5},
    {title: "Тераформування Марса", minPlayers: 1, maxPlayers: 5}
];

//Стрілкова функція, яка перевіряє чи підходить гра для n гравців
const fitsPlayers = (game, n) => n >= game.minPlayers && n <= game.maxPlayers;

//функція, яка циклом обробляє масив даних
function checkGamesForParty(gamesArray, playersCount){
    console.log(`\--- Шукаємо ігри для компанії з ${playersCount} людей ---`);

    for (const game of gamesArray) {
        //умовна класифікація, яка використовує стрілкову функцію
        if (fitsPlayers(game, playersCount)) {
            console.log(`Гра "${game.title}" підходить`);
        } else{
            console.log(`Гра "${game.title}" не підходить (розрахована на ${game.minPlayers}-${game.maxPlayers} гравців)`);
        }
    }
}

//виклик функції для перевірки результату для 6 гравців
checkGamesForParty(boardGames, 6);

//виклик функції для перевірки стрілкової функції окремо 
console.log("Чи підходить Брас для 6 гравців?", fitsPlayers(boardGames[5], 6));

