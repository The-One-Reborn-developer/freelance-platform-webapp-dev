export function handleTimerUpdate(messageData) {
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