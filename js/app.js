//Обрано React. Обґрунтування: React має зручний компонентний підхід на базі функцій (JSX) та ефективно оновлює інтерфейс за допомогою Virtual DOM.

const boardGames = [
    {id: 1, title: "Каркасон", minPlayers: 2, maxPlayers: 5, genre: "cards", img: "assets/karkason.png"},
    {id: 2, title: "Вибухові кошенята", minPlayers: 2, maxPlayers: 5, genre: "cards", img: "assets/vubyhoviKoshenata.png"},
    {id: 3, title: "Кіклади", minPlayers: 2, maxPlayers: 6, genre: "strategy", img: "assets/kiklady.png"},
    {id: 4, title: "Цитаделі", minPlayers: 2, maxPlayers: 8, genre: "cards", img: "assets/tsitadeli.jpg"},
    {id: 5, title: "Брас", minPlayers: 2, maxPlayers: 4, genre: "euro", img: "assets/brass.jpg"},
    {id: 6, title: "Норсгард", minPlayers: 2, maxPlayers: 5, genre: "strategy", img: "assets/northgard.jpg"},
    {id: 7, title: "Коуп", minPlayers: 3, maxPlayers: 6, genre: "party", img: "assets/coup.png"},
    {id: 8, title: "Зараження", minPlayers: 4, maxPlayers: 12, genre: "cooperat", img: "assets/zarazhenya.jpg"},
    {id: 9, title: "Саботер", minPlayers: 3, maxPlayers: 10, genre: "party", img: "assets/saboter.png"},
    {id: 10, title: "Орифлама", minPlayers: 3, maxPlayers: 5, genre: "cards", img: "assets/oriflama.jpg"},
    {id: 11, title: "Тераформування Марса", minPlayers: 1, genre: "euro", maxPlayers: 5, img: "assets/teraforyvanya.jpg"},
    {id: 12, title: "Череп", minPlayers: 3, maxPlayers: 6, genre: "party", img: "assets/skull.jpg"}
];

function GameCard({title, minPlayers, maxPlayers, genre, img, onGenreClick}){
    const genreNames = {
        strategy: "Стратегія", euro: "Євро", cards: "Карткові ігри", cooperat: "Кооперативні ігри", party: "Партійні ігри" 
    };

    return (
        <article>
            <img src={img} alt={`Настільна гра ${title}`}/>
            <h3>{title}</h3>

            <p
                style={{ fontStyle: "italic", margin: "0 0 10px 0", cursor: "pointer", color: "#00d2d3", textDecoration: "underline" }}
                onClick={() => onGenreClick(genre)}
                title="Натисніть, щоб відфільтрувати за цим жанром"
            >
                Жанр: {genreNames[genre] || genre}
            </p>
            <p>{minPlayers}-{maxPlayers} гравців</p>
        </article>
    );
}

function App(){
    const [searchText, setSearchText] = React.useState('');
    const [playerFilter, setPlayerFilter] = React.useState('all');
    const [genreFilter, setGenreFilter] = React.useState('all');

    const handleFilterGenre = (selectedGenre) => {
        setGenreFilter(selectedGenre);
    };

    const resetFilters = () => {
        setSearchText('');
        setPlayerFilter('all');
        setGenreFilter('all');
    };

    const filteredGames = boardGames.filter(game => {
        const matchesSearch = game.title.toLowerCase().includes(searchText.toLowerCase());
        const matchesPlayers = playerFilter === 'all' || 
            (Number(playerFilter) >= game.minPlayers && Number(playerFilter) <= game.maxPlayers);
        const matchesGenre = genreFilter === 'all' || game.genre === genreFilter;

        return matchesSearch && matchesPlayers && matchesGenre;
    });

    return (
        <React.Fragment>
            <section id="filters">
                <h2>Фільтри</h2>
                <form id="filter-form" onSubmit={(e) => e.preventDefault()}>
                    <label htmlFor="search-input">Пошук за назвою</label>
                    <input 
                        type="text" id="search-input" placeholder="Наприклад, Брас..."
                        value={searchText} onChange={(e) => setSearchText(e.target.value)}
                    />

                    <label htmlFor="player-filter">Кількість гравців:</label>
                    <select id="player-filter" value={playerFilter} onChange={(e) => setPlayerFilter(e.target.value)}>
                        <option value="all">Будь-яка кількість</option>
                        <option value="2">2 гравців</option>
                        <option value="3">3 гравців</option>
                        <option value="4">4 гравців</option>
                        <option value="5">5 гравців</option>
                    </select>

                    <label htmlFor="genre-filter">Жанр:</label>
                    <select id="genre-filter" value={genreFilter} onChange={(e) => setGenreFilter(e.target.value)}>
                        <option value="all">Всі жанри</option>
                        <option value="strategy">Стратегії</option>
                        <option value="euro">Євро</option>
                        <option value="cards">Карткові ігри</option>
                        <option value="cooperat">Кооперативні ігри</option>
                        <option value="party">Партійні ігри</option>
                    </select>
                    
                    <div className="filter-buttons">
                        <button type="button" className="filter-btn" onClick={resetFilters}>
                            Скинути фільтри
                        </button>
                    </div>
                </form>
            </section>

            <section id="games-list">
                <h2>Ігри (React версія)</h2>
                {filteredGames.length === 0 && (
                    <p style={{ gridColumn: '1 / -1', fontWeight: 'bold' }}>За вашим запитом ігор не знайдено.</p>
                )}
                {filteredGames.map(game => (
                    <GameCard 
                        key={game.id} 
                        title={game.title} 
                        minPlayers={game.minPlayers} 
                        maxPlayers={game.maxPlayers} 
                        genre={game.genre}
                        img={game.img}
                        onGenreClick={handleFilterGenre} 
                    />
                ))}
            </section>
        </React.Fragment>
    );
}

const rootElement = document.getElementById('react-root');
if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<App />);}