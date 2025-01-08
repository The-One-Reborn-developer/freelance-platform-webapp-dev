import {
    constructWebSocketURL
} from '../../modules/common_index.mjs';

import {
    handlePlayersAmountUpdate,
    handleTimerUpdate,
    handleMessageUpdate
} from "../../modules/game_index.mjs"


const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_BASE_DELAY = 5000; // 5 seconds
const CHOICE_TIMEOUT = 60000; // 1 minute
let SHOULD_RECONNECT = true;
let RECONNECT_ATTEMPTS = 0;
let CHOICE_REMAINING_TIME = CHOICE_TIMEOUT / 1000;
let TIMER_INTERVAL = null;


export function initializeWebSocket(validatedTelegramID, service, sessionID) {
    if (!validatedTelegramID) {
        console.error('Telegram ID not found, unable to initialize WebSocket');
        return;
    } else if (RECONNECT_ATTEMPTS >= MAX_RECONNECT_ATTEMPTS) {
        console.error('Maximum reconnect attempts reached, unable to initialize WebSocket');
        return;        
    } else {
        try {
            const socket = new WebSocket(constructWebSocketURL(validatedTelegramID, service, sessionID));

            socket.addEventListener('open', () => {
                console.log(`WebSocket connection established for Telegram ID: ${validatedTelegramID}. Service: ${service}. Session ID: ${sessionID}`);
                RECONNECT_ATTEMPTS = 0;
            });

            socket.addEventListener('close', () => {
                if (SHOULD_RECONNECT) {
                    RECONNECT_ATTEMPTS++;
                    const delay = RECONNECT_BASE_DELAY * Math.pow(2, RECONNECT_ATTEMPTS - 1); // Exponential backoff
                    setTimeout(() => initializeWebSocket(validatedTelegramID, service, sessionID), Math.min(delay, 60000)); // Limit to 1 minute    
                };
            });

            socket.addEventListener('error', (error) => {
                console.error(`WebSocket error for Telegram ID ${validatedTelegramID}: ${error}`);
            });

            socket.addEventListener('message', (event) => {
                try {
                    const messageData = JSON.parse(event.data);
                    console.log(`Received message: ${JSON.stringify(messageData)}`);
                    switch (messageData.type) {
                        case 'players_amount_update':
                            handlePlayersAmountUpdate(messageData);
                            break;
                        case 'timer_update':
                            handleTimerUpdate(messageData);
                            break;
                        case 'message_update':
                            handleMessageUpdate(messageData);
                            break;
                        case 'game_session_ad':
                            handleGameSessionAd(messageData, validatedTelegramID, sessionID, socket);
                            break;
                        case 'game_rematch':
                            startGame(validatedTelegramID, sessionID, socket);
                            break;
                        case 'game_result':
                            if (messageData.winner_telegram_id === validatedTelegramID) {
                                finishGame('winner');
                            } else {
                                SHOULD_RECONNECT = false;
                                socket.close();
                                finishGame('loser');
                            };
                            break;
                        case 'game_await':
                            gameAwait(socket);
                            break;
                        default:
                            console.warn(`Unknown message type: ${messageData.type}`);
                            break;
                    };
                } catch (error) {
                    console.error(`Error parsing message data: ${error}`);
                };
            });

            return socket;
        } catch (error) {
            console.error(`Error initializing WebSocket: ${error}`);
        };
    };
};


function handleGameSessionAd(messageData, validatedTelegramID, sessionID, socket) {
    console.log(`Received game session ad`);
    console.log(messageData);
    const videoPath = messageData.ad.ad_path;

    const videoContainer = document.getElementById('video-container');
    videoContainer.style.visibility = 'visible';

    const videoElement = document.getElementById('ad-video');
    const sourceElement = document.getElementById('ad-video-source');
    sourceElement.src = videoPath;
    videoElement.load();
    videoElement.play();

    videoElement.onended = () => {
        videoContainer.style.visibility = 'hidden';
        startGame(validatedTelegramID, sessionID, socket);
    };
};


function startGame(validatedTelegramID, sessionID, socket) {
    const gameDataPlayersAmount = document.getElementById('game-data-players-amount');
    const gameDataTimer = document.getElementById('game-data-timer');

    gameDataPlayersAmount.style.display = 'none';
    gameDataTimer.style.display = 'none';

    const display = document.getElementById('display');
    let choiceCountdownTimer = document.getElementById('choice-countdown-timer');
    if (!choiceCountdownTimer) {
        choiceCountdownTimer = document.createElement('div');
        choiceCountdownTimer.id = 'choice-countdown-timer';
        choiceCountdownTimer.className = 'game-data';
        choiceCountdownTimer.classList.add('choice-countdown-timer');
    };
    let gameContainer = document.getElementById('game-container');
    let choiceLabel = document.getElementById('choice-label');
    let choiceContainer = document.getElementById('choice-container');
    let firstChoice = document.getElementById('first-choice');
    let secondChoice = document.getElementById('second-choice');
    display.appendChild(choiceCountdownTimer);
    
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
    } else {
        choiceLabel.textContent = 'Оба игрока выбрали один и тот же вариант. Выбирайте ещё раз!';
    };

    choiceCountdownTimer.textContent = `Оставшееся время для выбора: ${timeRemaining} с.`;

    TIMER_INTERVAL = setInterval(() => {
        CHOICE_REMAINING_TIME--;
        choiceCountdownTimer.textContent = `Оставшееся время для выбора: ${timeRemaining} с.`;
        if (CHOICE_REMAINING_TIME <= 0) {
            clearInterval(TIMER_INTERVAL);
            SHOULD_RECONNECT = false;
            socket.close();
            finishGame('timeout');
        };
    }, 1000);

    firstChoice.addEventListener('click', () => {
        clearTimeout(choiceTimer);
        clearInterval(TIMER_INTERVAL);
        const playerChoice = firstChoice.getAttribute('value');
        handleGameChoice(validatedTelegramID, playerChoice, sessionID, socket);
    });

    secondChoice.addEventListener('click', () => {
        clearTimeout(choiceTimer);
        clearInterval(TIMER_INTERVAL);
        const playerChoice = secondChoice.getAttribute('value');
        handleGameChoice(validatedTelegramID, playerChoice, sessionID, socket);
    });
};


function handleGameChoice(validatedTelegramID, playerChoice, sessionID, socket) {
    const payload = JSON.stringify({
        type: 'player_choice',
        session_id: sessionID,
        player_choice: playerChoice,
        player_telegram_id: validatedTelegramID
    });

    socket.send(payload);
};


function finishGame(gameResult) {
    const display = document.getElementById('display');
    const gameContainer = document.getElementById('game-container');
    const choiceCountdownTimer = document.getElementById('choice-countdown-timer');
    const gameAwaitContainer = document.getElementById('game-await-container');
    gameContainer.style.display = 'none';
    choiceCountdownTimer.style.display = 'none';
    gameAwaitContainer.style.display = 'none';

    let gameResultContainer = document.getElementById('game-result-container');
    if (!gameResultContainer) {
        gameResultContainer = document.createElement('div');
        gameResultContainer.id = 'game-container';
        gameResultContainer.className = 'game-container';
    };

    if (gameResult === 'loser') {
        gameResultContainer.textContent = 'Вы проиграли! Попробуйте ещё раз в следующей игровой сессии.';
    } else if (gameResult === 'winner') {
        console.log('You win');
        gameResultContainer.textContent = 'Вы выиграли! Ожидайте прохождения в следующий раунд.';
    } else if (gameResult === 'timeout') {
        gameResultContainer.textContent = 'Вы не сделали выбор вовремя. Попробуйте ещё раз в следующей игровой сессии.';
    };

    display.appendChild(gameResultContainer);
};


function gameAwait(socket) {
    const display = document.getElementById('display');
    const gameContainer = document.getElementById('game-container');
    gameContainer.style.display = 'none';

    const gameAwaitContainer = document.createElement('div');
    gameAwaitContainer.id = 'game-await-container';
    gameAwaitContainer.className = 'game-data';
    gameAwaitContainer.classList.add('game-await-container');
    gameAwaitContainer.textContent = 'Второй игрок ещё не сделал выбор, ожидайте...';
    display.appendChild(gameAwaitContainer);

    let choiceCountdownTimer = document.getElementById('choice-countdown-timer');
    if (!choiceCountdownTimer) {
        choiceCountdownTimer = document.createElement('div');
        choiceCountdownTimer.id = 'choice-countdown-timer';
        choiceCountdownTimer.className = 'game-data';
        choiceCountdownTimer.classList.add('choice-countdown-timer');
        display.appendChild(choiceCountdownTimer);
    };

    choiceCountdownTimer.textContent = `Оставшееся время для выбора: ${timeRemaining} с.`;

    TIMER_INTERVAL = setInterval(() => {
        CHOICE_REMAINING_TIME--;
        choiceCountdownTimer.textContent = `Оставшееся время для выбора: ${timeRemaining} с.`;
        if (CHOICE_REMAINING_TIME <= 0) {
            clearInterval(TIMER_INTERVAL);
            finishGame('winner');
        };
    }, 1000);
};
