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
    };
        
    try {
        headerInfo.innerHTML = `Игрок ${name}. Баланс: ${wallet}₽. Зарегистрирован ${registrationDate}.`;

        const getNextGameSessionResponse = await fetch('/game/get-next-game-session');
        const getNextGameSessionResult = await getNextGameSessionResponse.json();

        if (!getNextGameSessionResult.success) {
            console.error('Failed to get next game session');
            showModal(getNextGameSessionResult.message);
        };

        const nextGameSessionID = getNextGameSessionResult.nextGameSession.id;

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
                session_id: nextGameSessionID
            })
        });
        const addPlayerResult = await addPlayerResponse.json();
        
        if (!addPlayerResult.success) {
            console.error('Failed to add player to the player count server-side');
        };
        
        showModal(addPlayerResult.message);

        // Start periodic player count update
        //startPlayerAmountRefresh(nextGameSessionID);
    } catch (error) {
        console.error(`Error in setupInterface: ${error}`);
        return;
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
