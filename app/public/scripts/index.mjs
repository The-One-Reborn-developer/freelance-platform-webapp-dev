window.Telegram.WebApp.disableVerticalSwipes()


const servicesButton = document.getElementById('service-services-button');
servicesButton.addEventListener('click', () => {
    window.location.href = '../views/services_register.html';
});


const deliveryButton = document.getElementById('service-delivery-button');
deliveryButton.addEventListener('click', () => {
    window.location.href = '../views/delivery_register.html';
});


const gameButton = document.getElementById('service-game-button');
gameButton.addEventListener('click', () => {
    window.location.href = '../views/game.html';
});
