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
                    <button id="roulette-spin-btn" class="btn btn-brand">Spin</button>
                </div>
                <div class="game-display">
                    <div id="roulette-wheel-container">
                        <img src="https://i.imgur.com/y1v2a0x.png" id="roulette-wheel" alt="Roulette Wheel">
                        <div id="roulette-pointer"></div>
                    </div>
                </div>
                <p style="text-align: center; margin-bottom: 10px;">Place your bets below (multiple allowed):</p>
                <div class="roulette-bets">
                    <button class="btn btn-danger" data-bet-type="red">RED (2x)</button>
                    <button class="btn btn-secondary" style="background: #222; color: #fff;" data-bet-type="black">BLACK (2x)</button>
                    <button class="btn btn-brand" data-bet-type="green">GREEN (14x)</button>
                    <button class="btn btn-secondary" data-bet-type="1-12">1-12 (3x)</button>
                    <button class="btn btn-secondary" data-bet-type="13-24">13-24 (3x)</button>
                    <button class="btn btn-secondary" data-bet-type="25-36">25-36 (3x)</button>
                </div>
                <div class="game-result" id="roulette-result"></div>
            </div>`,
        'mines-view': `
            <div class="game-view" id="mines-view">
                <div class="game-controls">
                    <input type="number" id="mines-bet" placeholder="Bet amount" value="10">
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
         // Add other game templates here...
        'coinflip-view': `
            <div class="game-view" id="coinflip-view">
                 <h2>Coming Soon!</h2>
                 <p>This classic game is being polished up.</p>
            </div>`,
        'towers-view': `
            <div class="game-view" id="towers-view">
                 <h2>Coming Soon!</h2>
                 <p>This game is under construction.</p>
            </div>`,
        'cases-view': `
            <div class="game-view" id="cases-view">
                 <h2>Coming Soon!</h2>
                 <p>Case Battles are being prepared for deployment.</p>
            </div>`,
        'plinko-view': `
            <div class="game-view" id="plinko-view">
                 <h2>Coming Soon!</h2>
                 <p>Get ready to drop the ball!</p>
            </div>`,
    };

    // --- CORE APP FUNCTIONS ---

    function init() {
        // Populate game views
        for (const viewId in gameTemplates) {
            gameViewsContainer.innerHTML += gameTemplates[viewId];
        }

        // Hide all game views except the default one
        document.querySelectorAll('.game-view').forEach(view => view.classList.add('hidden'));
        document.getElementById(state.activeView).classList.remove('hidden');

        // Check for saved user
        setTimeout(() => {
            loader.classList.add('hidden');
            const savedUser = localStorage.getItem('gambleSimUser');
            if (savedUser) {
                login(savedUser);
            } else {
                loginModal.classList.remove('hidden');
            }
        }, 1500);
    }
    
    function login(username) {
        state.username = username;
        state.balance = parseFloat(localStorage.getItem('gambleSimBalance')) || 1000.00;
        state.isAdmin = username.toLowerCase() === 'hexeriss';

        usernameDisplay.textContent = state.username;
        updateBalanceDisplay();

        loginModal.classList.add('hidden');
        appWrapper.classList.remove('hidden');
        appWrapper.style.display = 'grid'; // because hidden adds display:none !important

        if (state.isAdmin) {
            adminPanelBtn.classList.remove('hidden');
        }

        startChat();
        initAllGames();
    }

    function logout() {
        localStorage.removeItem('gambleSimUser');
        localStorage.removeItem('gambleSimBalance');
        window.location.reload();
    }
    
    function updateBalance(amount, type = 'set') {
        const prevBalance = state.balance;
        if (type === 'add') {
            state.balance += amount;
        } else if (type === 'remove') {
            state.balance -= amount;
        } else {
            state.balance = amount;
        }

        updateBalanceDisplay();
        
        // Visual feedback
        if (state.balance > prevBalance) {
            balanceDisplay.classList.add('balance-add');
            setTimeout(() => balanceDisplay.classList.remove('balance-add'), 500);
        } else if (state.balance < prevBalance) {
            balanceDisplay.classList.add('balance-remove');
            setTimeout(() => balanceDisplay.classList.remove('balance-remove'), 500);
        }
        
        localStorage.setItem('gambleSimBalance', state.balance);
    }

    function updateBalanceDisplay() {
        balanceDisplay.textContent = `$${state.balance.toFixed(2)}`;
    }

    function switchView(viewId) {
        state.activeView = viewId;
        document.querySelectorAll('.game-view').forEach(view => view.classList.add('hidden'));
        document.getElementById(viewId).classList.remove('hidden');

        navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.view === viewId);
        });

        const gameName = document.querySelector(`.nav-link[data-view="${viewId}"] span`).textContent;
        activeGameTitle.textContent = gameName;
    }
    
    function setGameRunning(isRunning) {
        state.isGameRunning = isRunning;
        // This is a simple way to disable controls. More complex logic may be needed per game.
        document.querySelectorAll('.game-controls button').forEach(btn => {
            // A few exceptions
            if(btn.id !== 'crash-cashout-btn') {
                 btn.disabled = isRunning;
            }
        });
    }

    // --- CHAT SIMULATION ---
    function startChat() {
        const botNames = ['CryptoKing', 'HighRoller', 'LuckyLucy', 'BetBot9000'];
        const botMessages = [
            'just won $500 on crash!', 'going all in on red!', 'Mines is paying out today!', 'who is feeling lucky?', 'that was a close call on crash!', '100x incoming??'
        ];

        setInterval(() => {
            const name = botNames[Math.floor(Math.random() * botNames.length)];
            const msg = botMessages[Math.floor(Math.random() * botMessages.length)];
            addChatMessage(name, msg, `bot-message-${Math.ceil(Math.random()*2)}`);
        }, 5000); // New message every 5 seconds
    }
    
    function addChatMessage(username, message, typeClass = 'user-message') {
        const msgEl = document.createElement('div');
        msgEl.classList.add('chat-message', typeClass);
        msgEl.innerHTML = `<span>${username}:</span> ${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}`; // Basic XSS protection
        chatMessages.appendChild(msgEl);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // --- EVENT LISTENERS ---
    loginButton.addEventListener('click', () => {
        const user = usernameInput.value.trim();
        if (user) {
            localStorage.setItem('gambleSimUser', user);
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
    
    // Admin panel logic
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
        // Init other games here
    }

    // --- CRASH LOGIC ---
    function initCrash() {
        const crashBetInput = document.getElementById('crash-bet');
        const crashStartBtn = document.getElementById('crash-start-btn');
        const crashCashoutBtn = document.getElementById('crash-cashout-btn');
        const crashChart = document.getElementById('crash-chart');
        const crashMultiplierDisplay = document.getElementById('crash-multiplier');
        const crashResult = document.getElementById('crash-result');

        let crashInterval, currentMultiplier, crashPoint, betAmount;

        crashStartBtn.addEventListener('click', () => {
            if (state.isGameRunning) return;
            betAmount = parseFloat(crashBetInput.value);
            if (isNaN(betAmount) || betAmount <= 0 || betAmount > state.balance) {
                crashResult.textContent = 'Invalid bet.'; return;
            }

            setGameRunning(true);
            crashStartBtn.disabled = true;
            crashCashoutBtn.disabled = false;
            updateBalance(betAmount, 'remove');
            crashChart.classList.remove('crashed');
            crashResult.textContent = '';
            currentMultiplier = 1.00;

            // More realistic crash point generation
            const r = Math.random();
            crashPoint = 1 / (1 - r) * 0.99; // 0.99 is house edge factor

            crashInterval = setInterval(() => {
                currentMultiplier += 0.01 * (currentMultiplier * 0.1);
                crashMultiplierDisplay.textContent = `${currentMultiplier.toFixed(2)}x`;
                if (currentMultiplier >= crashPoint) {
                    endCrash(true); // Game crashed
                }
            }, 100);
        });

        crashCashoutBtn.addEventListener('click', () => {
            if (state.isGameRunning && crashStartBtn.disabled) {
                endCrash(false); // Player cashed out
            }
        });

        function endCrash(didCrash) {
            clearInterval(crashInterval);
            if (didCrash) {
                crashChart.classList.add('crashed');
                crashMultiplierDisplay.textContent = `CRASH @ ${crashPoint.toFixed(2)}x`;
                crashResult.textContent = 'You lost!';
                crashResult.className = 'game-result result-loss';
            } else {
                const winnings = betAmount * currentMultiplier;
                updateBalance(winnings, 'add');
                crashResult.textContent = `Cashed out at ${currentMultiplier.toFixed(2)}x! Won $${(winnings - betAmount).toFixed(2)}`;
                crashResult.className = 'game-result result-win';
            }
            setGameRunning(false);
            crashStartBtn.disabled = false;
            crashCashoutBtn.disabled = true;
        }
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

            setGameRunning(true);
            updateBalance(totalBet, 'remove');
            resultDisplay.textContent = 'Spinning...';
            
            const randomIndex = Math.floor(Math.random() * wheelNumbers.length);
            const winningNumber = wheelNumbers[randomIndex];
            const segmentAngle = 360 / wheelNumbers.length;
            const randomOffset = (Math.random() - 0.5) * segmentAngle * 0.8;
            const rotation = (360 * 5) - (randomIndex * segmentAngle) - randomOffset;
            
            wheel.style.transform = `rotate(${rotation}deg)`;

            setTimeout(() => {
                let winnings = 0;
                let winningColor = numberColors.red.includes(winningNumber) ? 'red' : (numberColors.black.includes(winningNumber) ? 'black' : 'green');
                
                if (activeBets[winningColor]) winnings += betAmountPerSpot * (winningColor === 'green' ? 14 : 2);
                if (activeBets['1-12'] && winningNumber >= 1 && winningNumber <= 12) winnings += betAmountPerSpot * 3;
                if (activeBets['13-24'] && winningNumber >= 13 && winningNumber <= 24) winnings += betAmountPerSpot * 3;
                if (activeBets['25-36'] && winningNumber >= 25 && winningNumber <= 36) winnings += betAmountPerSpot * 3;
                
                if (winnings > 0) {
                    updateBalance(winnings, 'add');
                    resultDisplay.textContent = `Winner: ${winningNumber} (${winningColor.toUpperCase()}). You won $${(winnings-totalBet).toFixed(2)}!`;
                    resultDisplay.className = 'game-result result-win';
                } else {
                    resultDisplay.textContent = `Winner: ${winningNumber} (${winningColor.toUpperCase()}). You lost.`;
                    resultDisplay.className = 'game-result result-loss';
                }
                
                // Reset for next round
                setGameRunning(false);
                activeBets = {};
                betButtons.forEach(btn => btn.classList.remove('active'));

            }, 5200); // slightly longer than CSS transition
        });
    }

    // --- MINES LOGIC ---
    function initMines() {
        // This is a placeholder as the logic is complex.
        const startBtn = document.getElementById('mines-start-btn');
        startBtn.addEventListener('click', () => {
            document.getElementById('mines-result').textContent = 'Mines game is complex and coming in a future update!';
        });
    }

    // --- SLOTS LOGIC ---
    function initSlots() {
        const betInput = document.getElementById('slots-bet');
        const spinBtn = document.getElementById('slots-spin-btn');
        const reels = [document.getElementById('reel1'), document.getElementById('reel2'), document.getElementById('reel3')];
        const resultDisplay = document.getElementById('slots-result');
        const symbols = ['🍒', '🍋', '🍊', '🔔', '💎', '💰'];

        spinBtn.addEventListener('click', () => {
            if (state.isGameRunning) return;
            const bet = parseFloat(betInput.value);
            if (isNaN(bet) || bet <= 0 || bet > state.balance) {
                resultDisplay.textContent = 'Invalid bet.'; return;
            }
            
            setGameRunning(true);
            updateBalance(bet, 'remove');
            resultDisplay.textContent = 'Spinning!';

            reels.forEach((reel, i) => {
                const reelSymbols = [...symbols].sort(() => Math.random() - 0.5);
                reel.innerHTML = reelSymbols.join('<br>');
                const targetIndex = Math.floor(Math.random() * symbols.length);
                const targetY = -targetIndex * 100; // 100 is height of symbol
                reel.style.transform = `translateY(${targetY}px)`;
            });

            setTimeout(() => {
                // Simplified result check. In reality, you'd get the final symbols.
                const r = Math.random();
                if (r < 0.1) { // 10% chance to win big
                    const winnings = bet * 10;
                    updateBalance(winnings, 'add');
                    resultDisplay.textContent = `Jackpot! You won $${(winnings-bet).toFixed(2)}!`;
                    resultDisplay.className = 'game-result result-win';
                } else if (r < 0.3) { // 20% chance to win small
                    const winnings = bet * 2;
                    updateBalance(winnings, 'add');
                    resultDisplay.textContent = `Nice win! You won $${(winnings-bet).toFixed(2)}!`;
                    resultDisplay.className = 'game-result result-win';
                } else {
                    resultDisplay.textContent = 'Better luck next time!';
                    resultDisplay.className = 'game-result result-loss';
                }
                setGameRunning(false);
            }, 3200);
        });
    }

    // --- BLACKJACK LOGIC ---
    function initBlackjack() {
         const dealBtn = document.getElementById('blackjack-deal-btn');
         dealBtn.addEventListener('click', () => {
            document.getElementById('blackjack-result').textContent = 'Blackjack is complex and coming in a future update!';
        });
    }


    // --- INITIALIZE THE APP ---
    init();
});
