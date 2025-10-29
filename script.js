document.addEventListener('DOMContentLoaded', () => {

    // --- STATE MANAGEMENT ---
    const state = {
        username: null,
        balance: 1000.00,
        isAdmin: false,
        activeView: 'crash-view',
        isGameRunning: false,
    };

    // --- DOM ELEMENTS ---
    const loader = document.getElementById('loader-wrapper');
    const loginModal = document.getElementById('login-modal');
    const appWrapper = document.getElementById('app-wrapper');
    const usernameInput = document.getElementById('username-input');
    const loginButton = document.getElementById('login-button');
    const usernameDisplay = document.getElementById('username-display');
    const balanceDisplay = document.getElementById('balance-display');
    const logoutButton = document.getElementById('logout-button');
    const navLinks = document.querySelectorAll('.nav-link');
    const gameViewsContainer = document.querySelector('.game-views');
    const activeGameTitle = document.getElementById('active-game-title');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send-btn');
    const adminPanelBtn = document.getElementById('admin-panel-btn');
    const adminModal = document.getElementById('admin-modal');
    const adminCloseBtn = document.getElementById('admin-close-btn');

    // --- GAME HTML TEMPLATES ---
    const gameTemplates = {
        'crash-view': `
            <div class="game-view" id="crash-view">
                <div class="game-controls">
                    <input type="number" id="crash-bet" placeholder="Bet amount" value="10">
                    <button id="crash-start-btn" class="btn btn-brand">Bet</button>
                    <button id="crash-cashout-btn" class="btn btn-danger" disabled>Cash Out</button>
                </div>
                <div class="game-display">
                    <div id="crash-chart"><span id="crash-multiplier">1.00x</span></div>
                </div>
                <div class="game-result" id="crash-result"></div>
            </div>`,
        'roulette-view': `
            <div class="game-view" id="roulette-view">
                <div class="game-controls">
                    <input type="number" id="roulette-bet" placeholder="Bet amount" value="10">
                </div>
                 <p style="text-align: center; margin-bottom: 10px;">Place your bets on one or more spots:</p>
                <div class="roulette-bets">
                    <button class="btn btn-danger" data-bet-type="red">RED (2x)</button>
                    <button class="btn btn-secondary" style="background: #222; color: #fff;" data-bet-type="black">BLACK (2x)</button>
                    <button class="btn btn-brand" data-bet-type="green">GREEN (14x)</button>
                </div>
                <div class="game-controls" style="margin-top: 15px; justify-content: center;">
                    <button id="roulette-spin-btn" class="btn btn-brand">Spin</button>
                </div>
                <div class="game-display">
                    <div id="roulette-wheel-container">
                        <img src="https://i.imgur.com/y1v2a0x.png" id="roulette-wheel" alt="Roulette Wheel">
                        <div id="roulette-pointer"></div>
                    </div>
                </div>
                <div class="game-result" id="roulette-result"></div>
            </div>`,
        'mines-view': `
            <div class="game-view" id="mines-view">
                <div class="game-controls">
                    <input type="number" id="mines-bet" placeholder="Bet amount" value="10" min="1">
                    <label for="mines-count">Mines:</label>
                    <input type="number" id="mines-count" value="3" min="1" max="24">
                    <button id="mines-start-btn" class="btn btn-brand">Start Game</button>
                    <button id="mines-cashout-btn" class="btn btn-danger" disabled>Cashout</button>
                </div>
                <div class="game-display">
                    <div id="mines-grid"></div>
                    <div id="mines-info" style="text-align: center; margin-top: 10px; font-weight: 600;">Current Multiplier: 1.00x</div>
                </div>
                <div class="game-result" id="mines-result"></div>
            </div>`,
        'slots-view': `
            <div class="game-view" id="slots-view">
                <div class="game-controls">
                    <input type="number" id="slots-bet" placeholder="Bet amount" value="5">
                    <button id="slots-spin-btn" class="btn btn-brand">Spin Reels</button>
                </div>
                <div class="game-display">
                    <div id="slots-reels">
                        <div class="reel"><div class="reel-inner" id="reel1">🍒</div></div>
                        <div class="reel"><div class="reel-inner" id="reel2">🍋</div></div>
                        <div class="reel"><div class="reel-inner" id="reel3">🔔</div></div>
                    </div>
                </div>
                <div class="game-result" id="slots-result"></div>
            </div>`,
        'blackjack-view': `
            <div class="game-view" id="blackjack-view">
                <div class="game-controls">
                    <input type="number" id="blackjack-bet" placeholder="Bet amount" value="25">
                    <button id="blackjack-deal-btn" class="btn btn-brand">Deal</button>
                    <button id="blackjack-hit-btn" class="btn btn-secondary" disabled>Hit</button>
                    <button id="blackjack-stand-btn" class="btn btn-danger" disabled>Stand</button>
                </div>
                <div class="game-display">
                    <h4>Dealer's Hand (<span id="dealer-hand-value">0</span>)</h4>
                    <div class="dealer-cards" id="dealer-cards"></div>
                    <h4 style="margin-top:20px;">Your Hand (<span id="player-hand-value">0</span>)</h4>
                    <div class="player-cards" id="player-cards"></div>
                </div>
                <div class="game-result" id="blackjack-result"></div>
            </div>`,
        'coinflip-view': `<div class="game-view" id="coinflip-view"><h2>Coming Soon!</h2><p>This classic game is being polished up.</p></div>`,
        'towers-view': `<div class="game-view" id="towers-view"><h2>Coming Soon!</h2><p>This game is under construction.</p></div>`,
        'cases-view': `<div class="game-view" id="cases-view"><h2>Coming Soon!</h2><p>Case Battles are being prepared.</p></div>`,
        'plinko-view': `<div class="game-view" id="plinko-view"><h2>Coming Soon!</h2><p>Get ready to drop the ball!</p></div>`,
    };

    // --- CORE APP FUNCTIONS ---

    function init() {
        for (const viewId in gameTemplates) {
            gameViewsContainer.innerHTML += gameTemplates[viewId];
        }

        document.querySelectorAll('.game-view').forEach(view => view.classList.add('hidden'));
        document.getElementById(state.activeView).classList.remove('hidden');

        setTimeout(() => {
            loader.classList.add('hidden');
            const savedUser = localStorage.getItem('hexCasinoUser');
            if (savedUser) {
                login(savedUser);
            } else {
                loginModal.classList.remove('hidden');
            }
        }, 1500);
    }
    
    function login(username) {
        state.username = username;
        state.balance = parseFloat(localStorage.getItem('hexCasinoBalance')) || 1000.00;
        state.isAdmin = username.toLowerCase() === 'hexeriss';

        usernameDisplay.textContent = state.username;
        updateBalanceDisplay();

        loginModal.classList.add('hidden');
        appWrapper.classList.remove('hidden'); // This is the fix. Just remove the class.

        if (state.isAdmin) {
            adminPanelBtn.classList.remove('hidden');
        }

        startChat();
        initAllGames();
    }

    function logout() {
        localStorage.removeItem('hexCasinoUser');
        localStorage.removeItem('hexCasinoBalance');
        window.location.reload();
    }
    
    function updateBalance(amount, type = 'set') {
        const prevBalance = state.balance;
        if (type === 'add') {
            state.balance += amount;
        } else if (type === 'remove') {
            if (state.balance - amount < 0) { // Prevent negative balance
                state.balance = 0;
            } else {
                state.balance -= amount;
            }
        } else {
            state.balance = amount;
        }

        updateBalanceDisplay();
        
        if (state.balance > prevBalance) {
            balanceDisplay.classList.add('balance-add');
            setTimeout(() => balanceDisplay.classList.remove('balance-add'), 500);
        } else if (state.balance < prevBalance) {
            balanceDisplay.classList.add('balance-remove');
            setTimeout(() => balanceDisplay.classList.remove('balance-remove'), 500);
        }
        
        localStorage.setItem('hexCasinoBalance', state.balance);
    }

    function updateBalanceDisplay() {
        balanceDisplay.textContent = `$${state.balance.toFixed(2)}`;
    }

    function switchView(viewId) {
        if (state.isGameRunning) {
             addChatMessage('SYSTEM', 'Please finish your current game before switching.', 'admin-message');
            return;
        }
        state.activeView = viewId;
        document.querySelectorAll('.game-view').forEach(view => view.classList.add('hidden'));
        document.getElementById(viewId).classList.remove('hidden');

        navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.view === viewId);
        });

        const gameName = document.querySelector(`.nav-link[data-view="${viewId}"] span`).textContent;
        activeGameTitle.textContent = gameName;
    }
    
    function setGameRunning(isRunning, gameId) {
        state.isGameRunning = isRunning;
        const controls = document.querySelector(`#${gameId} .game-controls`);
        if (controls) {
            controls.querySelectorAll('button, input').forEach(el => {
                // Specific logic to handle enabling/disabling during game
                if (el.id.includes('cashout') || el.id.includes('hit') || el.id.includes('stand')) {
                    // These buttons might be enabled during a game
                } else {
                    el.disabled = isRunning;
                }
            });
        }
    }

    // --- CHAT SIMULATION ---
    function startChat() {
        const botNames = ['CryptoKing', 'HighRoller', 'LuckyLucy', 'BetBot9000'];
        const botMessages = [
            'just won $500 on crash!', 'going all in on red!', 'Mines is paying out today!', 'who is feeling lucky?', 'that was a close call on crash!', '100x incoming??'
        ];

        addChatMessage('HexCasino', 'Welcome to the chat! Please be respectful.', 'bot-message-1');

        setInterval(() => {
            const name = botNames[Math.floor(Math.random() * botNames.length)];
            const msg = botMessages[Math.floor(Math.random() * botMessages.length)];
            addChatMessage(name, msg, `bot-message-${Math.ceil(Math.random()*2)}`);
        }, 8000 + Math.random() * 5000); 
    }
    
    function addChatMessage(username, message, typeClass = 'user-message') {
        const msgEl = document.createElement('div');
        msgEl.classList.add('chat-message', typeClass);
        msgEl.innerHTML = `<span>${username}:</span> ${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}`; 
        chatMessages.appendChild(msgEl);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // --- EVENT LISTENERS ---
    loginButton.addEventListener('click', () => {
        const user = usernameInput.value.trim();
        if (user) {
            localStorage.setItem('hexCasinoUser', user);
            login(user);
        }
    });
    
    usernameInput.addEventListener('keyup', (e) => {
        if(e.key === 'Enter') loginButton.click();
    });

    logoutButton.addEventListener('click', logout);
    
    navLinks.forEach(link => {
        link.addEventListener('click', () => switchView(link.dataset.view));
    });

    chatSendBtn.addEventListener('click', () => {
        const msg = chatInput.value.trim();
        if (msg) {
            addChatMessage(state.username, msg);
            chatInput.value = '';
        }
    });
    chatInput.addEventListener('keyup', (e) => {
        if(e.key === 'Enter') chatSendBtn.click();
    });

    adminPanelBtn.addEventListener('click', () => adminModal.classList.remove('hidden'));
    adminCloseBtn.addEventListener('click', () => adminModal.classList.add('hidden'));
    
    document.getElementById('set-balance-btn').addEventListener('click', () => {
        const newBal = parseFloat(document.getElementById('set-balance-input').value);
        if(!isNaN(newBal)) {
            updateBalance(newBal);
            addChatMessage('SYSTEM', `Admin set balance to $${newBal.toFixed(2)}`, 'admin-message');
            adminModal.classList.add('hidden');
        }
    });

    document.getElementById('admin-send-msg-btn').addEventListener('click', () => {
        const msg = document.getElementById('admin-message-input').value;
        if(msg) {
            addChatMessage('ANNOUNCEMENT', msg, 'admin-message');
            adminModal.classList.add('hidden');
            document.getElementById('admin-message-input').value = '';
        }
    });


    // =================================================================================
    // --- GAME INITIALIZATION & LOGIC ---
    // =================================================================================
    
    function initAllGames() {
        initCrash();
        initRoulette();
        initMines();
        initSlots();
        initBlackjack();
    }

    // --- CRASH LOGIC ---
    function initCrash() {
        const betInput = document.getElementById('crash-bet');
        const startBtn = document.getElementById('crash-start-btn');
        const cashoutBtn = document.getElementById('crash-cashout-btn');
        const chart = document.getElementById('crash-chart');
        const multiplierDisplay = document.getElementById('crash-multiplier');
        const result = document.getElementById('crash-result');

        let crashInterval, currentMultiplier, crashPoint, betAmount, hasCashedOut;

        function startCrashGame() {
            betAmount = parseFloat(betInput.value);
            if (isNaN(betAmount) || betAmount <= 0 || betAmount > state.balance) {
                result.textContent = 'Invalid bet.'; return;
            }

            setGameRunning(true, 'crash-view');
            hasCashedOut = false;
            startBtn.disabled = true;
            cashoutBtn.disabled = false;
            updateBalance(betAmount, 'remove');
            chart.classList.remove('crashed');
            result.textContent = '';
            currentMultiplier = 1.00;
            
            const r = Math.random();
            crashPoint = Math.max(1.0, 1 / (1 - r) * 0.98); // 0.98 is house edge factor, ensure it's at least 1.0

            crashInterval = setInterval(() => {
                const increment = 0.01 + (currentMultiplier * 0.01);
                currentMultiplier += increment;
                multiplierDisplay.textContent = `${currentMultiplier.toFixed(2)}x`;
                if (currentMultiplier >= crashPoint) {
                    endCrash(true);
                }
            }, 100);
        }

        function cashoutCrash() {
            if (state.isGameRunning && !hasCashedOut) {
                hasCashedOut = true;
                endCrash(false);
            }
        }

        function endCrash(didCrash) {
            clearInterval(crashInterval);
            if (didCrash) {
                chart.classList.add('crashed');
                multiplierDisplay.textContent = `CRASH @ ${crashPoint.toFixed(2)}x`;
                if (!hasCashedOut) {
                     result.textContent = 'You lost!';
                     result.className = 'game-result result-loss';
                }
            } else { // Player cashed out
                const winnings = betAmount * currentMultiplier;
                updateBalance(winnings, 'add');
                result.textContent = `Cashed out at ${currentMultiplier.toFixed(2)}x! Won $${(winnings).toFixed(2)}`;
                result.className = 'game-result result-win';
            }
            setGameRunning(false, 'crash-view');
            startBtn.disabled = false;
            cashoutBtn.disabled = true;
        }
        
        startBtn.addEventListener('click', startCrashGame);
        cashoutBtn.addEventListener('click', cashoutCrash);
    }

    // --- ROULETTE LOGIC ---
    function initRoulette() {
        const betInput = document.getElementById('roulette-bet');
        const spinBtn = document.getElementById('roulette-spin-btn');
        const wheel = document.getElementById('roulette-wheel');
        const resultDisplay = document.getElementById('roulette-result');
        const betButtons = document.querySelectorAll('.roulette-bets button');
        
        const wheelNumbers = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
        const numberColors = {
            red: [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36],
            black: [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35],
            green: [0]
        };

        let activeBets = {};

        betButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                if (state.isGameRunning) return;
                const betType = btn.dataset.betType;
                btn.classList.toggle('active');
                if (btn.classList.contains('active')) {
                    activeBets[betType] = true;
                } else {
                    delete activeBets[betType];
                }
            });
        });

        spinBtn.addEventListener('click', () => {
            if (state.isGameRunning || Object.keys(activeBets).length === 0) return;
            
            const betAmountPerSpot = parseFloat(betInput.value);
            const totalBet = betAmountPerSpot * Object.keys(activeBets).length;
            
            if (isNaN(totalBet) || totalBet <= 0 || totalBet > state.balance) {
                resultDisplay.textContent = 'Invalid total bet.'; return;
            }

            setGameRunning(true, 'roulette-view');
            updateBalance(totalBet, 'remove');
            resultDisplay.textContent = 'Spinning...';
            
            const randomIndex = Math.floor(Math.random() * wheelNumbers.length);
            const winningNumber = wheelNumbers[randomIndex];
            const segmentAngle = 360 / wheelNumbers.length;
            const randomOffset = (Math.random() - 0.5) * segmentAngle * 0.8;
            const rotation = (360 * 5) - (randomIndex * segmentAngle) - randomOffset;
            
            wheel.style.transition = 'transform 5s cubic-bezier(0.2, 0.8, 0.2, 1)';
            wheel.style.transform = `rotate(${rotation}deg)`;

            setTimeout(() => {
                let winnings = 0;
                let winningColor = numberColors.red.includes(winningNumber) ? 'red' : (numberColors.black.includes(winningNumber) ? 'black' : 'green');
                
                if (activeBets[winningColor]) winnings += betAmountPerSpot * (winningColor === 'green' ? 14 : 2);
                
                if (winnings > 0) {
                    updateBalance(winnings, 'add');
                    resultDisplay.textContent = `Winner: ${winningNumber} (${winningColor.toUpperCase()}). You won $${(winnings).toFixed(2)}!`;
                    resultDisplay.className = 'game-result result-win';
                } else {
                    resultDisplay.textContent = `Winner: ${winningNumber} (${winningColor.toUpperCase()}). You lost.`;
                    resultDisplay.className = 'game-result result-loss';
                }
                
                setGameRunning(false, 'roulette-view');
                activeBets = {};
                betButtons.forEach(btn => btn.classList.remove('active'));
                wheel.style.transition = 'none'; // Prevent animation on reset
            }, 5200);
        });
    }

    // --- MINES LOGIC ---
    function initMines() {
        const betInput = document.getElementById('mines-bet');
        const minesCountInput = document.getElementById('mines-count');
        const startBtn = document.getElementById('mines-start-btn');
        const cashoutBtn = document.getElementById('mines-cashout-btn');
        const grid = document.getElementById('mines-grid');
        const infoDisplay = document.getElementById('mines-info');
        const resultDisplay = document.getElementById('mines-result');
        const gridSize = 25;
        let gameState = {};

        function calculateMultiplier(tilesClicked, mines) {
            if (tilesClicked === 0) return 1;
            // A common formula for mines multiplier
            let multiplier = 1;
            for(let i=0; i < tilesClicked; i++) {
                multiplier *= (gridSize - mines - i) / (gridSize - i);
            }
            return 1 / multiplier * 0.95; // 0.95 house edge
        }

        function startGame() {
            const bet = parseFloat(betInput.value);
            const minesCount = parseInt(minesCountInput.value);

            if (isNaN(bet) || bet <= 0 || bet > state.balance) {
                resultDisplay.textContent = 'Invalid bet.'; return;
            }
            if (isNaN(minesCount) || minesCount < 1 || minesCount >= gridSize) {
                resultDisplay.textContent = 'Invalid mine count (1-24).'; return;
            }
            
            setGameRunning(true, 'mines-view');
            updateBalance(bet, 'remove');
            startBtn.disabled = true;
            cashoutBtn.disabled = false;
            resultDisplay.textContent = '';
            infoDisplay.textContent = 'Current Multiplier: 1.00x';

            const bombs = new Set();
            while(bombs.size < minesCount) {
                bombs.add(Math.floor(Math.random() * gridSize));
            }

            gameState = {
                bet,
                minesCount,
                bombs,
                revealed: new Set(),
                currentMultiplier: 1.00,
            };

            renderGrid();
        }

        function renderGrid() {
            grid.innerHTML = '';
            for (let i = 0; i < gridSize; i++) {
                const cell = document.createElement('div');
                cell.className = 'mine-cell';
                cell.dataset.index = i;
                if (gameState.revealed.has(i)) {
                    cell.classList.add('revealed', 'safe');
                    cell.innerHTML = '💎';
                }
                cell.addEventListener('click', () => onCellClick(i));
                grid.appendChild(cell);
            }
        }

        function onCellClick(index) {
            if (!state.isGameRunning || gameState.revealed.has(index)) return;

            if (gameState.bombs.has(index)) {
                // Game over - hit a bomb
                resultDisplay.textContent = 'BOOM! You hit a mine.';
                resultDisplay.className = 'game-result result-loss';
                endGame(true);
            } else {
                // Safe click
                gameState.revealed.add(index);
                gameState.currentMultiplier = calculateMultiplier(gameState.revealed.size, gameState.minesCount);
                infoDisplay.textContent = `Current Multiplier: ${gameState.currentMultiplier.toFixed(2)}x`;
                renderGrid();
            }
        }
        
        function cashout() {
            if (!state.isGameRunning || gameState.revealed.size === 0) return;
            const winnings = gameState.bet * gameState.currentMultiplier;
            updateBalance(winnings, 'add');
            resultDisplay.textContent = `Cashed out for $${winnings.toFixed(2)}!`;
            resultDisplay.className = 'game-result result-win';
            endGame(false);
        }

        function endGame(showBombs) {
            setGameRunning(false, 'mines-view');
            cashoutBtn.disabled = true;
            startBtn.disabled = false;
            
            if (showBombs) {
                grid.querySelectorAll('.mine-cell').forEach(cell => {
                    const index = parseInt(cell.dataset.index);
                    if (gameState.bombs.has(index)) {
                        cell.classList.add('revealed', 'bomb');
                        cell.innerHTML = '💣';
                    }
                });
            }
             gameState = {};
        }

        startBtn.addEventListener('click', startGame);
        cashoutBtn.addEventListener('click', cashout);
    }

    // --- SLOTS LOGIC ---
    function initSlots() {
        const betInput = document.getElementById('slots-bet');
        const spinBtn = document.getElementById('slots-spin-btn');
        const reels = [document.getElementById('reel1'), document.getElementById('reel2'), document.getElementById('reel3')];
        const resultDisplay = document.getElementById('slots-result');
        const symbols = ['🍒', '🍋', '🍊', '🔔', '💎', '💰'];
        const payouts = { '💰💰💰': 50, '💎💎💎': 20, '🔔🔔🔔': 15, '🍊🍊🍊': 10, '🍋🍋🍋': 5, '🍒🍒🍒': 3 };

        spinBtn.addEventListener('click', () => {
            if (state.isGameRunning) return;
            const bet = parseFloat(betInput.value);
            if (isNaN(bet) || bet <= 0 || bet > state.balance) {
                resultDisplay.textContent = 'Invalid bet.'; return;
            }
            
            setGameRunning(true, 'slots-view');
            updateBalance(bet, 'remove');
            resultDisplay.textContent = 'Spinning!';
            resultDisplay.className = 'game-result';

            let finalSymbols = [];
            reels.forEach((reel, i) => {
                const reelSymbols = [...symbols, ...symbols, ...symbols].sort(() => Math.random() - 0.5);
                reel.innerHTML = reelSymbols.join('<br>');
                const targetIndex = Math.floor(Math.random() * symbols.length) + symbols.length; // Spin to a symbol in the middle
                const targetY = -targetIndex * 100; // 100 is height of symbol
                reel.style.transition = `transform ${3 + i*0.5}s ease-out`;
                reel.style.transform = `translateY(${targetY}px)`;
                finalSymbols.push(reelSymbols[targetIndex]);
            });

            setTimeout(() => {
                const resultKey = finalSymbols.join('');
                const payoutMultiplier = payouts[resultKey];

                if (payoutMultiplier) {
                    const winnings = bet * payoutMultiplier;
                    updateBalance(winnings, 'add');
                    resultDisplay.textContent = `Jackpot! ${resultKey} - You won $${winnings.toFixed(2)}!`;
                    resultDisplay.className = 'game-result result-win';
                } else {
                     resultDisplay.textContent = 'No win. Better luck next time!';
                     resultDisplay.className = 'game-result result-loss';
                }
                setGameRunning(false, 'slots-view');
            }, 4500); // Wait for longest reel to finish
        });
    }

    // --- BLACKJACK LOGIC ---
    function initBlackjack() {
        const betInput = document.getElementById('blackjack-bet');
        const dealBtn = document.getElementById('blackjack-deal-btn');
        const hitBtn = document.getElementById('blackjack-hit-btn');
        const standBtn = document.getElementById('blackjack-stand-btn');
        const dealerCardsDiv = document.getElementById('dealer-cards');
        const playerCardsDiv = document.getElementById('player-cards');
        const dealerValueSpan = document.getElementById('dealer-hand-value');
        const playerValueSpan = document.getElementById('player-hand-value');
        const resultDisplay = document.getElementById('blackjack-result');

        let deck, playerHand, dealerHand, bet;

        const createDeck = () => {
            const suits = ['♥', '♦', '♣', '♠'];
            const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
            let newDeck = [];
            for (let suit of suits) {
                for (let value of values) {
                    newDeck.push({ suit, value });
                }
            }
            return newDeck;
        };

        const shuffleDeck = (deck) => {
            for (let i = deck.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [deck[i], deck[j]] = [deck[j], deck[i]];
            }
        };

        const getCardValue = (card) => {
            if (['J', 'Q', 'K'].includes(card.value)) return 10;
            if (card.value === 'A') return 11;
            return parseInt(card.value);
        };

        const getHandValue = (hand) => {
            let value = hand.reduce((sum, card) => sum + getCardValue(card), 0);
            let aces = hand.filter(card => card.value === 'A').length;
            while (value > 21 && aces > 0) {
                value -= 10;
                aces--;
            }
            return value;
        };

        const renderCard = (card, isHidden = false) => {
            const cardDiv = document.createElement('div');
            cardDiv.className = 'card';
            if (isHidden) {
                cardDiv.classList.add('hidden');
            } else {
                cardDiv.textContent = card.value;
                if (['♥', '♦'].includes(card.suit)) {
                    cardDiv.classList.add('red');
                }
            }
            return cardDiv;
        };
        
        const deal = () => {
            bet = parseFloat(betInput.value);
             if (isNaN(bet) || bet <= 0 || bet > state.balance) {
                resultDisplay.textContent = 'Invalid bet.'; return;
            }

            setGameRunning(true, 'blackjack-view');
            updateBalance(bet, 'remove');
            resultDisplay.textContent = '';
            
            deck = createDeck();
            shuffleDeck(deck);
            playerHand = [deck.pop(), deck.pop()];
            dealerHand = [deck.pop(), deck.pop()];
            
            dealBtn.disabled = true;
            hitBtn.disabled = false;
            standBtn.disabled = false;
            
            renderHands();

            if (getHandValue(playerHand) === 21) {
                stand(); // Auto-stand on blackjack
            }
        };
        
        const hit = () => {
            playerHand.push(deck.pop());
            renderHands();
            if (getHandValue(playerHand) > 21) {
                endGame(false, 'Bust! You lose.');
            }
        };

        const stand = () => {
            hitBtn.disabled = true;
            standBtn.disabled = true;

            // Reveal dealer's hidden card
            renderHands(true);
            
            let dealerValue = getHandValue(dealerHand);
            const playerValue = getHandValue(playerHand);

            if (playerValue > 21) return; // Player already busted

            const dealerTurn = () => {
                if(dealerValue < 17) {
                    dealerHand.push(deck.pop());
                    renderHands(true);
                    dealerValue = getHandValue(dealerHand);
                    setTimeout(dealerTurn, 800);
                } else {
                    if (dealerValue > 21 || playerValue > dealerValue) {
                        endGame(true, 'You win!');
                    } else if (dealerValue > playerValue) {
                        endGame(false, 'Dealer wins.');
                    } else {
                        endGame(null, 'Push. Bet returned.'); // Push
                    }
                }
            };
            setTimeout(dealerTurn, 800);
        };
        
        const renderHands = (showDealerFull = false) => {
            playerCardsDiv.innerHTML = '';
            playerHand.forEach(card => playerCardsDiv.appendChild(renderCard(card)));
            playerValueSpan.textContent = getHandValue(playerHand);
            
            dealerCardsDiv.innerHTML = '';
            dealerCardsDiv.appendChild(renderCard(dealerHand[0]));
            dealerCardsDiv.appendChild(renderCard(dealerHand[1], !showDealerFull));
            dealerValueSpan.textContent = showDealerFull ? getHandValue(dealerHand) : getCardValue(dealerHand[0]);
        };
        
        const endGame = (isWin, message) => {
            if (isWin) {
                const winnings = getHandValue(playerHand) === 21 && playerHand.length === 2 ? bet * 2.5 : bet * 2; // Blackjack pays 3:2
                updateBalance(winnings, 'add');
                resultDisplay.className = 'game-result result-win';
            } else if (isWin === false) {
                 resultDisplay.className = 'game-result result-loss';
            } else { // Push
                updateBalance(bet, 'add');
                resultDisplay.className = 'game-result';
            }
            resultDisplay.textContent = message;
            setGameRunning(false, 'blackjack-view');
            dealBtn.disabled = false;
            hitBtn.disabled = true;
            standBtn.disabled = true;
        }

        dealBtn.addEventListener('click', deal);
        hitBtn.addEventListener('click', hit);
        standBtn.addEventListener('click', stand);
    }

    init();
});
