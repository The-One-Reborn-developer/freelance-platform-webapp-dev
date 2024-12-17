window.Telegram.WebApp.disableVerticalSwipes()

const servicesButton = document.getElementById('service-services-button');
servicesButton.addEventListener('click', () => {
    window.location.href = '../views/services_register.html';
});