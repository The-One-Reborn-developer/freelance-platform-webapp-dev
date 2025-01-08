export function handlePlayersAmountUpdate(messageData) {
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
