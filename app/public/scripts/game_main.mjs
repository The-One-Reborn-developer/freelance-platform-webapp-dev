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

            initializeWebSocket(validatedTelegramID, 'game');

            await setupInterface(validatedTelegramID, name, wallet, registrationDate);
        } catch (error) {
            console.error(`Error in window.onload: ${error}`);
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

            // Add player to the player count server-side
            const response = await fetch('/game/add-player', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    player_telegram_id: validatedTelegramID,
                    player_name: name
                })
            })
            
            const result = await response.json();
            
            if (!result.success) {
                console.error('Failed to add player to the player count server-side');
                showModal(result.message);

                // Show players amount after failed player addition
                await displayPlayersAmount();
                
                // Start periodic player count update
                startPlayerAmountRefresh();
            } else {
                console.log('Player added to the player count server-side');
                showModal(result.message);

                // Show players amount after successful player addition
                await displayPlayersAmount();
                
                // Start periodic player count update
                startPlayerAmountRefresh();
            };
        } catch (error) {
            console.error(`Error in setupInterface: ${error}`);
        };
    };
};


function startPlayerAmountRefresh() {
    setInterval(() => {
        displayPlayersAmount();
    }, PLAYER_AMOUNT_REFRESH_INTERVAL);
};


async function displayPlayersAmount() {
    const display = document.getElementById('display');
    if (!display) {
        console.error('Display element not found');
        return;
    } else {
        try {
            const response = await fetch('/game/get-players-amount');
            
            const data = await response.json();
            
            if (data.success) {
                const playersAmountElement = document.createElement('div');
                playersAmountElement.classList.add('players-amount');
                playersAmountElement.textContent = `Количество игроков: ${data.playersAmount}`;
                display.appendChild(playersAmountElement);
            } else {
                console.error('Failed to get players amount');
            };
        } catch (error) {
            console.error(`Error in displayPlayersAmount: ${error}`);
        };
    };
};
