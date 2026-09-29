const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

const games = [
    {id: 1, title: "Каркасон", minPlayers: 2, maxPlayers: 5, genre: "cards", img: "assets/karkason.png", duration: 35, owned: true},
    {id: 2, title: "Вибухові кошенята", minPlayers: 2, maxPlayers: 5, genre: "cards", img: "assets/vubyhoviKoshenata.png", duration: 15, owned: true},
    {id: 3, title: "Кіклади", minPlayers: 2, maxPlayers: 6, genre: "strategy", img: "assets/kiklady.png", duration: 90, owned: true},
    {id: 4, title: "Цитаделі", minPlayers: 2, maxPlayers: 8, genre: "cards", img: "assets/tsitadeli.jpg", duration: 40, owned: true},
    {id: 5, title: "Брас", minPlayers: 2, maxPlayers: 4, genre: "euro", img: "assets/brass.jpg", duration: 150, owned: true},
    {id: 6, title: "Нортґард", minPlayers: 2, maxPlayers: 5, genre: "strategy", img: "assets/northgard.jpg", duration: 60, owned: false},
    {id: 7, title: "Коуп", minPlayers: 3, maxPlayers: 6, genre: "party", img: "assets/coup.png", duration: 15, owned: true},
    {id: 8, title: "Зараження", minPlayers: 4, maxPlayers: 12, genre: "cooperat", img: "assets/zarazhenya.jpg", duration: 25, owned: true},
    {id: 9, title: "Саботер", minPlayers: 3, maxPlayers: 10, genre: "party", img: "assets/saboter.png", duration: 30, owned: true},
    {id: 10, title: "Орифлама", minPlayers: 3, maxPlayers: 5, genre: "cards", img: "assets/oriflama.jpg", duration: 20, owned: true},
    {id: 11, title: "Тераформування Марса", minPlayers: 1, genre: "euro", maxPlayers: 5, img: "assets/teraforyvanya.jpg", duration: 110, owned: false},
    {id: 12, title: "Череп", minPlayers: 3, maxPlayers: 6, genre: "party", img: "assets/skull.jpg", duration: 25, owned: true},
    {id: 13, title: "Шикуйсь! Куряче військо", minPlayers: 2, maxPlayers: 4, genre: "cards", img: "assets/shukys.jpg", duration: 20, owned: true}
];

app.use(express.static(path.join(__dirname, '../')));

app.get('/api/games', (req, res) => {
    res.json(games);
});

app.get('/api/games/:id', (req, res) =>{
    const gameId = parseInt(req.params.id);
    const game = games.find(g => g.id === gameId);

    if(game){
        res.json(game);
    } else{
        res.status(404).json({message: "Гру за вказаним ID не знайдено"});
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});