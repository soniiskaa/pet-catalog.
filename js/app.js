//Обрано React. Обґрунтування: React має зручний компонентний підхід на базі функцій (JSX) та ефективно оновлює інтерфейс за допомогою Virtual DOM.

const boardGames = [
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

const routes = [
    {path: '/', view: 'Home'},
    {path: '/owned', view: 'Owned'},
    {path: '/games/:id', view: 'GameDetail'}
];

function matchRoute(hash) {
    if(!hash || hash === '#/' || hash === '') hash = '#/';

    const path = hash.replace('#', '');
    for(let route of routes){
        const regex = new RegExp('^' + route.path.replace(/:\w+/g, '(\\w+)') + '$');
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

function saveToLocalStorage(item){
    try{
        localStorage.setItem('boardGames_v1', JSON.stringify(item));
    } catch(error){
        console.error("Помилка збереження в localStorage:", error);
    }
}

function loadFromLocalStorage(){
    try{
        const savedData = localStorage.getItem('boardGames_v1');
        return savedData ? JSON.parse(savedData) : null;
    } catch(error){
        console.error("Помилка читання в localStorage:", error);
        return null;
    }
}

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

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

async function getAllItems() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
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

async function deleteItem(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

async function migrateDataIfNeeded() {
    const isMigrated = localStorage.getItem('is_migrated_to_idb');
    if (isMigrated === 'true') {
        return; 
    }

    const existingDbItems = await getAllItems();
    
    if (existingDbItems.length === 0) {
        const localData = loadFromLocalStorage(); 
        
        if (localData && localData.length > 0) {
            for (const game of localData) {
                await addItem(game);
            }
            console.log("Міграцію з localStorage в IndexedDB успішно виконано!");
        } else {
            for (const game of boardGames) {
                await addItem(game);
            }
            console.log("IndexedDB ініціалізовано початковим списком ігор.");
        }
    }

    localStorage.setItem('is_migrated_to_idb', 'true');
}

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
            <p
                style={{ fontStyle: "italic", margin: "0 0 10px 0", cursor: "pointer", color: "#00d2d3", textDecoration: "underline" }}
                onClick={() => onGenreClick(genre)}
                title="Натисніть, щоб відфільтрувати за цим жанром"
            >
                Жанр: {genreNames[genre] || genre}
            </p>
            <p className="player-badge">{minPlayers}-{maxPlayers} гравців • {duration} хв</p>
            
            <button 
                onClick={() => onToggleOwned(id)}
                style={{
                    marginTop: '10px',
                    padding: '8px 15px',
                    backgroundColor: owned ? '#27ae60' : '#e74c3c', 
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    width: '100%'
                }}
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
    React.useEffect(() => {
        const handleHashChange = () => {
            setCurrentRoute(matchRoute(window.location.hash));
        };
        window.addEventListener('hashchange', handleHashChange);
        
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    React.useEffect(() => {
        async function fetchGames() {
            try{
            await migrateDataIfNeeded();
            const dataFromDB = await getAllItems();
            setGames(dataFromDB);
            }catch(error){
                console.error("Помилка IndexedDB:", error);
                setDbError("Не вдалося отримати доступ до бази даних. Можливо, ви використовуєте режим інкогніто або приватного перегляду, де збереження даних заборонено.");
            }
        }
        
        fetchGames();
    }, []);

    const [searchText, setSearchText] = React.useState('');
    const [playerFilter, setPlayerFilter] = React.useState('all');
    const [genreFilter, setGenreFilter] = React.useState('all');

    const handleFilterGenre = (selectedGenre) => setGenreFilter(selectedGenre);

    const resetFilters = () => {
        setSearchText('');
        setPlayerFilter('all');
        setGenreFilter('all');
    };

    const handleToggleOwned = async (id) => {
        const gameToUpdate = games.find(game => game.id === id);
        if (!gameToUpdate) return;

        const updatedGame = { ...gameToUpdate, owned: !gameToUpdate.owned };
        
        await updateItem(updatedGame);
        
        const freshData = await getAllItems();
        setGames(freshData);
    };

    const filteredGames = games.filter(game => { 
        const matchesSearch = game.title.toLowerCase().includes(searchText.toLowerCase());
        const matchesPlayers = playerFilter === 'all' || 
            (Number(playerFilter) >= game.minPlayers && Number(playerFilter) <= game.maxPlayers);
        const matchesGenre = genreFilter === 'all' || game.genre === genreFilter;

        return matchesSearch && matchesPlayers && matchesGenre;
    });

    const today = new Date().getDate();
    const gameOfTheDayId = games.length > 0 ? games[today % games.length].id : null;

    let displayedGames = filteredGames;
    if (currentRoute && currentRoute.view === 'Owned') {
        displayedGames = displayedGames.filter(game => game.owned === true);
    }

    if (!currentRoute) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
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
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <h2>Гру не знайдено або дані ще завантажуються...</h2>
                    <a href="#/" className="filter-btn" style={{ textDecoration: 'none' }}>Повернутися до списку</a>
                </div>
            );
        }

        return (
            <section style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', textAlign: 'center', maxWidth: '600px', margin: '0 auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <h2>Деталі гри: {game.title}</h2>
                <img src={game.img} alt={game.title} style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '8px' }} />
                
                <div style={{ textAlign: 'left', margin: '20px auto', maxWidth: '300px', fontSize: '1.1rem' }}>
                    <p><strong>🕒 Час гри:</strong> {game.duration} хвилин</p>
                    <p><strong>👥 Гравці:</strong> {game.minPlayers} - {game.maxPlayers}</p>
                    <p><strong>🎭 Жанр:</strong> {game.genre}</p>
                    <p><strong>📦 Статус:</strong> {game.owned ? '✅ В колекції / Зіграно' : '⏳ Немає / Не грали'}</p>
                </div>

                <button 
                    onClick={() => handleToggleOwned(game.id)} 
                    className="filter-btn" 
                    style={{ backgroundColor: game.owned ? '#27ae60' : '#e74c3c' }}
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
                {/* ... тут залишається твоя форма фільтрів (form) без змін ... */}
                <form id="filter-form" onSubmit={(e) => e.preventDefault()}>
                    {/* ... твої інпути ... */}
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
                
                {/* ЗВЕРНИ УВАГУ: використовуємо displayedGames замість filteredGames */}
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
    root.render(<App />);}