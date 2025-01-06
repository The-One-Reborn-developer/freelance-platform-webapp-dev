import { 
    getQueryParameter,
    getUserData,
    initializeWebSocket
} from "./modules/common_index.mjs";

import {
    showModal
} from "./modules/game_index.mjs";


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

    document.addEventListener('startGame', (event) => {
        console.log('Starting game');
        startGame();
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
    } catch (error) {
        console.error(`Error in setupInterface: ${error}`);
        return;
    };
};


function startGame() {
    const gameDataPlayersAmount = document.getElementById('game-data-players-amount');
    const gameDataTimer = document.getElementById('game-data-timer');

    gameDataPlayersAmount.style.display = 'none';
    gameDataTimer.style.display = 'none';

    const display = document.getElementById('display');
    let gameContainer = document.getElementById('game-container');
    let choiceLabel = document.getElementById('choice-label');
    let choiceContainer = document.getElementById('choice-container');
    let firstChoice = document.getElementById('first-choice');
    let secondChoice = document.getElementById('second-choice');
    
    if (
        !gameContainer ||
        !choiceLabel ||
        !choiceContainer ||
        !firstChoice ||
        !secondChoice
    ) {
        console.warn('Game elements elements not found, creating new ones');

        gameContainer = document.createElement('div');
        gameContainer.id = 'game-container';
        gameContainer.className = 'game-container';
        display.appendChild(gameContainer);

        choiceLabel = document.createElement('label');
        choiceLabel.id = 'choice-label';
        choiceLabel.className = 'choice-label';
        choiceLabel.textContent = 'Выберите вариант';
        gameContainer.appendChild(choiceLabel);

        choiceContainer = document.createElement('div');
        choiceContainer.id = 'choice-container';
        choiceContainer.className = 'choice-container';
        gameContainer.appendChild(choiceContainer);

        firstChoice = document.createElement('button');
        firstChoice.id = 'first-choice';
        firstChoice.className = 'game-button';
        firstChoice.setAttribute('value', '1');
        firstChoice.textContent = '1';
        secondChoice = document.createElement('button');
        secondChoice.id = 'second-choice';
        secondChoice.className = 'game-button';
        secondChoice.setAttribute('value', '2');
        secondChoice.textContent = '2';
        choiceContainer.appendChild(firstChoice);
        choiceContainer.appendChild(secondChoice);
    };
};
