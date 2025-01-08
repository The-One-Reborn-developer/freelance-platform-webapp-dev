import { scrollToBottom } from '../../modules/common_index.mjs';


let shouldReconnect = true;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_BASE_DELAY = 5000; // 5 seconds
const CHOICE_TIMEOUT = 60000; // 1 minute


export function initializeWebSocket(validatedTelegramID, service, sessionID) {
    if (!validatedTelegramID) {
        console.error('Telegram ID not found, unable to initialize WebSocket');
        return;
    } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        console.error('Maximum reconnect attempts reached, unable to initialize WebSocket');
        return;        
    } else {
        const socket = new WebSocket(constructWebSocketURL(validatedTelegramID, service, sessionID));

        socket.addEventListener('open', () => {
            console.log(`WebSocket connection established for Telegram ID: ${validatedTelegramID}. Service: ${service}. Session ID: ${sessionID}`);
            reconnectAttempts = 0;
        });

        socket.addEventListener('close', () => {
            if (shouldReconnect) {
                reconnectAttempts++;
                const delay = RECONNECT_BASE_DELAY * Math.pow(2, reconnectAttempts - 1); // Exponential backoff
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
                            shouldReconnect = false;
                            socket.close();
                            finishGame('loser');
                        };
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
    };
};


function constructWebSocketURL(telegramID, service, sessionID) {
    const queryParameters = new URLSearchParams({
        'telegram_id': telegramID,
        'service': service,
    });

    if (service === 'game') {
        queryParameters.append('session_id', sessionID);
    };

    return `wss://${window.location.host}?${queryParameters.toString()}`;
};


function handlePlayersAmountUpdate(messageData) {
    let playersAmountElement = document.getElementById('game-data-players-amount');

    if (!playersAmountElement) {
        console.warn('Players amount element not found, creating a new one');
        playersAmountElement = document.createElement('div');
        playersAmountElement.id = 'game-data-players-amount';
        playersAmountElement.className = 'game-data';
        playersAmountElement.classList.add('game-data-players-amount');
        document.getElementById('display').appendChild(playersAmountElement);
    };

    playersAmountElement.textContent = `Количество игроков: ${messageData.players_amount}`;
};


function handleTimerUpdate(messageData) {
    let timerElement = document.getElementById('game-data-timer');

    if (!timerElement) {
        console.warn('Timer element not found, creating a new one');
        timerElement = document.createElement('div');
        timerElement.id = 'game-data-timer';
        timerElement.className = 'game-data';
        timerElement.classList.add('game-data-timer');
        document.getElementById('display').appendChild(timerElement);
    };

    const { hours, minutes, seconds } = formatRemainingTime(messageData.remaining_time);

    switch (messageData.status) {
        case 'pending':
            timerElement.textContent = `До следующего игрового сеанса: ${hours} ч. ${minutes} мин. ${seconds} с.`;
            break;
        case 'ongoing':
            timerElement.textContent = `Игра начинается через ${minutes} мин. ${seconds} с.`;
            break;
        case 'finished':
            timerElement.textContent = 'Игра окончена';
            break;
    };
};


function formatRemainingTime(remainingTime) {
    const hours = Math.floor(remainingTime / 3600);
    const minutes = Math.floor((remainingTime % 3600) / 60);
    const seconds = Math.floor(remainingTime % 60);

    return {
        hours,
        minutes,
        seconds
    };
};


function handleMessageUpdate(messageData) {
    const normalizedData = {
        senderTelegramID: messageData.sender_telegram_id,
        senderName: messageData.sender_name,
        message: messageData.message,
        attachment: messageData.attachment
    };

    if (!normalizedData.senderName || !normalizedData.message) {
        console.error('Invalid message data received');
        return;
    } else if (
        !messageData ||
        typeof messageData.sender_name !== 'string' ||
        typeof messageData.message !== 'string' ||
        messageData.sender_name.trim() === '' ||
        messageData.message.trim() === ''
    ) {
        console.error('Invalid message data received');
        return;
    };

    console.log(`Valid message received from ${messageData.sender_name.trim()}: ${messageData.message.trim()}`);

    const chatHistory = document.getElementById('chat-history');
    if (normalizedData.attachment) {
        chatHistory.innerHTML += `<div class="chat-message">
                                    ${normalizedData.senderName}
                                    <br><br><img src="${normalizedData.attachment}" alt="Файл" class="attachment-image">
                                    <br><br>${new Date().toLocaleString('ru-RU', { timezone: 'Europe/Moscow' })}
                                </div>`;
    } else {
        chatHistory.innerHTML += `<div class="chat-message">
                                    ${normalizedData.senderName}
                                    <br><br>${normalizedData.message}
                                    <br><br>${new Date().toLocaleString('ru-RU', { timezone: 'Europe/Moscow' })}
                                </div>`;
    };

    const display = document.getElementById('display');
    scrollToBottom(display);
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
    } else {
        choiceLabel.textContent = 'Оба игрока выбрали один и тот же вариант. Выбирайте ещё раз!';
    };

    let timeRemaining = CHOICE_TIMEOUT / 1000;
    gameDataTimer.textContent = `Оставшееся время для выбора: ${timeRemaining} с.`;

    const timerInterval = setInterval(() => {
        timeRemaining--;
        gameDataTimer.textContent = `Оставшееся время для выбора: ${timeRemaining} с.`;
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
        };
    }, 1000);

    const choiceTimer = setTimeout(() => {
        clearInterval(timerInterval);
        finishGame('timeout');
    }, CHOICE_TIMEOUT);

    firstChoice.addEventListener('click', () => {
        clearTimeout(choiceTimer);
        clearInterval(timerInterval);
        const playerChoice = firstChoice.getAttribute('value');
        handleGameChoice(validatedTelegramID, playerChoice, sessionID, socket);
    });

    secondChoice.addEventListener('click', () => {
        clearTimeout(choiceTimer);
        clearInterval(timerInterval);
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
    gameContainer.style.display = 'none';

    const gameResultContainer = document.createElement('div');
    gameResultContainer.id = 'game-container';
    gameResultContainer.className = 'game-container';

    if (gameResult === 'loser') {
        gameResultContainer.textContent = 'Вы проиграли! Попробуйте ещё раз в следующей игровой сессии.';
    } else if (gameResult === 'winner') {
        gameResultContainer.textContent = 'Вы выиграли! Ожидайте прохождения в следующий раунд.';
    } else if (gameResult === 'timeout') {
        gameResultContainer.textContent = 'Вы не сделали выбор вовремя. Попробуйте ещё раз в следующей игровой сессии.';
    };
    display.appendChild(gameResultContainer);
};
