import { 
    getQueryParameter,
    getUserData,
    initializeWebSocket
} from "./modules/common_index.mjs";

import {
    showModal
} from "./modules/game_index.mjs";


const PLAYER_AMOUNT_REFRESH_INTERVAL = 10000; // 10 seconds


window.onload = async function () {
    window.Telegram.WebApp.disableVerticalSwipes()
    
    const telegramID = getQueryParameter('telegram_id');
    if (telegramID) {
        try {
            const userData = await getUserData(telegramID);
            const validatedTelegramID = userData.userData.telegram_id;
            const name = userData.userData.game_name;
            const wallet = userData.userData.game_wallet;
            const registrationDate = userData.userData.game_registration_date;

            await setupInterface(validatedTelegramID, name, wallet, registrationDate);
        } catch (error) {
            console.error(`Error in window.onload: ${error}`);
            return;
        };
    };                      

    // Ensure that the keyboard is closed when the user touches the screen outside of input elements
    document.addEventListener('touchstart', (event) => {
        if (!event.target.closest('input, textarea, select')) {
            document.activeElement.blur();
        };
    });
};


async function setupInterface(validatedTelegramID, name, wallet, registrationDate) {
    const headerNav = document.getElementById('header-nav');
    const headerInfo = document.getElementById('header-user-info');

    if (!headerNav || !headerInfo) {
        console.error('Header navigation element not found');
        return;
    } else {
        try {
            headerInfo.innerHTML = `Игрок ${name}. Баланс: ${wallet}₽. Зарегистрирован ${registrationDate}.`;

            const getNextGameSessionResponse = await fetch('/game/get-next-game-session');
            const getNextGameSessionResult = await getNextGameSessionResponse.json();

            if (!getNextGameSessionResult.success) {
                console.error('Failed to get next game session');
                showModal(getNextGameSessionResult.message);
            };
            const nextGameSessionID = getNextGameSessionResult.nextGameSession.id;
            const nextGameSessionDate = new Date(getNextGameSessionResult.nextGameSession.session_date);
            if (isNaN(nextGameSessionDate.getTime())) {
                console.error('Failed to parse next game session date');
                showModal('Произошла ошибка при получении даты следующего игрового сеанса.');
                return;                
            };

            initializeWebSocket(validatedTelegramID, 'game', nextGameSessionID);

            // Add player to the player count server-side
            const addPlayerResponse = await fetch('/game/add-player', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    player_telegram_id: validatedTelegramID,
                    player_name: name,
                    session_id: getNextGameSessionResult.nextGameSession.id
                })
            })
            const addPlayerResult = await addPlayerResponse.json();
            
            if (!addPlayerResult.success) {
                console.error('Failed to add player to the player count server-side');
            };
            
            showModal(addPlayerResult.message);

            // Show players amount and time until next game after failed player addition
            await displayPlayersAmount(nextGameSessionID);
            await displayTimeUntilNextGameSession();
            
            // Start periodic player count update
            startPlayerAmountRefresh(nextGameSessionID);
        } catch (error) {
            console.error(`Error in setupInterface: ${error}`);
            return;
        };
    };
};


function startPlayerAmountRefresh(nextGameSessionID) {
    setInterval(() => {
        displayPlayersAmount(nextGameSessionID);
    }, PLAYER_AMOUNT_REFRESH_INTERVAL);
};


async function displayPlayersAmount(nextGameSessionID) {
    const display = document.getElementById('display');
    if (!display) {
        console.error('Display element not found');
        return;
    } else {
        try {
            const response = await fetch(`/game/get-players-amount?session_id=${nextGameSessionID}`);
            const data = await response.json();

            if (!data.success) {
                console.error('Failed to get players amount');
                showModal(data.message);
                return;
            };

            let gameDataPlayersAmount = document.getElementById('game-data-players-amount');
            if (!gameDataPlayersAmount) {
                gameDataPlayersAmount = document.createElement('div');
                gameDataPlayersAmount.id = 'game-data-players-amount';
                gameDataPlayersAmount.className = 'game-data';
                gameDataPlayersAmount.classList.add('game-data-players-amount');
                gameDataPlayersAmount.textContent = `Количество игроков: ${data.playersAmount}`;
                display.appendChild(gameDataPlayersAmount);
            };

            gameDataPlayersAmount.textContent = `Количество игроков: ${data.playersAmount}`;
        } catch (error) {
            console.error(`Error in displayPlayersAmount: ${error}`);
            return;
        };
    };
};


async function displayTimeUntilNextGameSession() {
    const display = document.getElementById('display');
    if (!display) {
        console.error('Display element not found');
        return;
    } else {
        try {
            const response = await fetch('/game/get-next-game-session');
            const data = await response.json();
            
            if (!data.success) {
                console.error('Failed to get time until next game session');
                showModal(data.message);
                return;
            }

            const nextGameSessionCountDownTimer = data.nextGameSession.countdown_timer;
            const nextGameSessionDate = new Date(data.nextGameSession.session_date);
            if (isNaN(nextGameSessionDate.getTime())) {
                console.error('Failed to parse next game session date');
                showModal('Произошла ошибка при получении даты следующего игрового сеанса.');
                return;                
            }

            let gameDataTimer = document.getElementById('game-data-timer');
            if (!gameDataTimer) {
                gameDataTimer = document.createElement('div');
                gameDataTimer.id = 'game-data-timer';
                gameDataTimer.className = 'game-data';
                gameDataTimer.classList.add('game-data-timer');
                display.appendChild(gameDataTimer);
            };

            let timerInterval;

            const updateTimer = () => {
                const now = new Date();
                const timeDifference = nextGameSessionDate - now;

                if (timeDifference <= 0) {
                    displayGameCountdownTimer(nextGameSessionCountDownTimer);
                    clearInterval(timerInterval);
                    return;
                };

                const hours = Math.floor(timeDifference / (1000 * 60 * 60));
                const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

                gameDataTimer.textContent = `Время до следующего игрового сеанса: ${hours} ч. ${minutes} мин. ${seconds} с.`;
            };
            
            // Start timer
            updateTimer(); // Initial update
            timerInterval = setInterval(updateTimer, 1000);
        } catch (error) {
            console.error(`Error in displayTimeUntilNextGameSession: ${error}`);
            showModal('Произошла ошибка при отображении таймера до следующего игрового сеанса.');
            return;
        };
    };
};


function displayGameCountdownTimer(countdownTimer) {
    const display = document.getElementById('display');
    if (!display) {
        console.error('Display element not found');
        return;
    } else {
        display.removeChild(document.getElementById('game-data-timer'));
        const gameCountdown = document.createElement('div');
        gameCountdown.id = 'game-countdown';
        gameCountdown.className = 'game-data';
        gameCountdown.classList.add('game-data-timer');
        gameCountdown.innerHTML = `Игра начнется через ${countdownTimer} минут.`;
        display.appendChild(gameCountdown);
    };
};
