const routes = [
    {path: '/', view: 'Home'},
    {path: '/owned', view: 'Owned'},
    {path: '/games/:id', view: 'GameDetail'}
];

function matchRoute(hash) {
    if(!hash || hash === '#/' || hash === '') hash = '#/';

    const path = hash.replace('#', '');
    for(let route of routes){
        // Виправлено регулярний вираз на пошук чисел (\d+)
        const regex = new RegExp('^' + route.path.replace(/:\w+/g, '(\\d+)') + '$');
        const match = path.match(regex);
        if (match) {
            return {
                view: route.view,
                id: match[1] ? parseInt(match[1]) : null 
            };
        }
    }
    return null;
}

// === IndexedDB Логіка ===
const DB_NAME = 'BoardGamesDB'; 
const DB_VERSION = 1;           
const STORE_NAME = 'games';

function openDB(){
    return new Promise((resolve, reject) =>{
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

async function addItem(item) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.put(item); 
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}
const updateItem = addItem; 

// === Компоненти React ===

function GameCard({id, title, minPlayers, maxPlayers, genre, img, duration, owned, isGameOfTheDay, onGenreClick, onToggleOwned}){
    const genreNames = {
        strategy: "Стратегія", euro: "Євро", cards: "Карткові ігри", cooperat: "Кооперативні ігри", party: "Партійні ігри" 
    };

    return (
        <article className={isGameOfTheDay ? "game-of-the-day" : ""}>
            <img src={img} alt={`Настільна гра ${title}`}/>
            <h3>
                <a href={`#/games/${id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {title} 🔗
                </a>
            </h3>
            <p className="genre-link" onClick={() => onGenreClick(genre)} title="Натисніть, щоб відфільтрувати за цим жанром">
                Жанр: {genreNames[genre] || genre}
            </p>
            <p className="player-badge">{minPlayers}-{maxPlayers} гравців • {duration} хв</p>
            
            <button 
                onClick={() => onToggleOwned(id)}
                className={`status-btn ${owned ? 'owned' : 'not-owned'}`}
            >
                {owned ? "Зіграно" : "Ще не грали"}
            </button>
        </article>
    );
}

function App(){
    const [games, setGames] = React.useState([]);
    const [dbError, setDbError] = React.useState(null);
    const [currentRoute, setCurrentRoute] = React.useState(() => matchRoute(window.location.hash));

    const [searchTerm, setSearchTerm] = React.useState('');
    const [playersFilter, setPlayersFilter] = React.useState('');
    const [genreFilter, setGenreFilter] = React.useState('all');

    // Відновлено відслідковування зміни URL (роутинг)
    React.useEffect(() => {
        const handleHashChange = () => {
            setCurrentRoute(matchRoute(window.location.hash));
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // Отримання даних з API
    React.useEffect(() => {
        async function fetchGames(){
            try {
                // Додано слеш спереду, щоб запит йшов від кореня
                const response = await fetch('/api/games');
                if(!response.ok) throw new Error(`Помилка HTTP: ${response.status}`);
                
                const dataFromAPI = await response.json();
                setGames(dataFromAPI);
            } catch(error) {
                console.error("Помилка завантаження з АРІ: ", error);
                setDbError("Не вдалося завантажити дані з сервера.");
            }
        }
        fetchGames();
    }, []);

    const handleFilterGenre = (selectedGenre) => setGenreFilter(selectedGenre);

    const resetFilters = () => {
        setSearchTerm('');
        setPlayersFilter('');
        setGenreFilter('all');
    };

    const handleToggleOwned = async (id) => {
        // Миттєве оновлення інтерфейсу (React state)
        setGames(prevGames => prevGames.map(game => 
            game.id === id ? { ...game, owned: !game.owned } : game
        ));

        // Оновлення в базі IndexedDB (фоново)
        const gameToUpdate = games.find(game => game.id === id);
        if (gameToUpdate) {
            const updatedGame = { ...gameToUpdate, owned: !gameToUpdate.owned };
            await updateItem(updatedGame);
        }
    };

    const today = new Date().getDate();
    const gameOfTheDayId = games.length > 0 ? games[today % games.length].id : null;

    const filteredGames = games.filter(game => {
        const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPlayers = playersFilter === '' || 
            (game.minPlayers <= parseInt(playersFilter) && game.maxPlayers >= parseInt(playersFilter));
        const matchesGenre = genreFilter === 'all' || game.genre === genreFilter;
        
        return matchesSearch && matchesPlayers && matchesGenre;
    });

    let displayedGames = filteredGames;
    if (currentRoute && currentRoute.view === 'Owned') {
        displayedGames = displayedGames.filter(game => game.owned === true);
    }

    if (!currentRoute) {
        return (
            <div className="error-page">
                <h2>Сторінку не знайдено (404) </h2>
                <p>Здається, ви перейшли за неправильним посиланням.</p>
                <a href="#/" className="filter-btn" style={{ textDecoration: 'none', display: 'inline-block', marginTop: '20px' }}>Повернутися на головну</a>
            </div>
        );
    }

    if (currentRoute.view === 'GameDetail') {
        const game = games.find(g => g.id === currentRoute.id);

        if (!game) {
            return (
                <div className="error-page">
                    <h2>Гру не знайдено або дані ще завантажуються...</h2>
                    <a href="#/" className="filter-btn" style={{ textDecoration: 'none' }}>Повернутися до списку</a>
                </div>
            );
        }

        return (
            <section className="game-detail-card">
                <h2>Деталі гри: {game.title}</h2>
                <img src={game.img} alt={game.title} className="game-detail-img" />
                
                <div className="game-detail-info">
                    <p><strong>🕒 Час гри:</strong> {game.duration} хвилин</p>
                    <p><strong>👥 Гравці:</strong> {game.minPlayers} - {game.maxPlayers}</p>
                    <p><strong>🎭 Жанр:</strong> {game.genre}</p>
                    <p><strong>📦 Статус:</strong> {game.owned ? '✅ В колекції / Зіграно' : '⏳ Немає / Не грали'}</p>
                </div>

                <button 
                    onClick={() => handleToggleOwned(game.id)} 
                    className={`status-btn ${game.owned ? 'owned' : 'not-owned'}`}
                >
                    {game.owned ? "Позначити як 'Не грали'" : "Позначити як 'Зіграно'"}
                </button>
                <br /><br />
                
                <a href="#/" className="filter-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>⬅ Повернутися назад</a>
            </section>
        );
    }

    return (
        <React.Fragment>
            <section id="filters">
                <h2>{currentRoute.view === 'Owned' ? 'Моя колекція' : 'Фільтри'}</h2>
                <form id="filter-form" className="filter-form" onSubmit={(e) => e.preventDefault()}>
                    <input 
                        type="text" 
                        className="filter-input"
                        placeholder="Пошук за назвою..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <input 
                        type="number" 
                        className="filter-input"
                        placeholder="Кількість гравців" 
                        value={playersFilter}
                        onChange={(e) => setPlayersFilter(e.target.value)}
                    />
                    <select 
                        className="filter-select"
                        value={genreFilter} 
                        onChange={(e) => setGenreFilter(e.target.value)}
                    >
                        <option value="all">Всі жанри</option>
                        <option value="cards">Карткові</option>
                        <option value="strategy">Стратегії</option>
                        <option value="euro">Євро</option>
                        <option value="party">Партійні</option>
                        <option value="cooperat">Кооперативні</option>
                    </select>
    
                    <div className="filter-buttons">
                        <button type="button" className="filter-btn" onClick={resetFilters}>
                            Скинути фільтри
                        </button>
                    </div>
                </form>
            </section>

            <section id="games-list">
                <h2>{currentRoute.view === 'Owned' ? 'Ігри в наявності' : 'Всі ігри'}</h2>
                
                {dbError && ( <div className="error-box">⚠️ {dbError}</div> )}
                
                {displayedGames.length === 0 && !dbError && (
                    <p style={{ gridColumn: '1 / -1', fontWeight: 'bold' }}>За вашим запитом ігор не знайдено.</p>
                )}
                
                {displayedGames.map(game => (
                    <GameCard 
                        key={game.id} 
                        id={game.id} 
                        title={game.title} 
                        minPlayers={game.minPlayers} 
                        maxPlayers={game.maxPlayers} 
                        genre={game.genre}
                        img={game.img}
                        duration={game.duration}
                        owned={game.owned}
                        isGameOfTheDay={game.id === gameOfTheDayId}
                        onGenreClick={handleFilterGenre} 
                        onToggleOwned={handleToggleOwned}
                    />
                ))}
            </section>
        </React.Fragment>
    );
}

const rootElement = document.getElementById('react-root');
if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<App />);
}