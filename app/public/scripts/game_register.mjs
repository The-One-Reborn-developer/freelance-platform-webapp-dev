window.Telegram.WebApp.disableVerticalSwipes()

const registerButton = document.getElementById('register-button');
const nameInput = document.getElementById('name-input');
const nameLabel = document.getElementById('name-label');

const registrationForm = document.getElementById('registration-form');
registrationForm.style.display = 'none';
const loadingContainer = document.getElementById('loading-container');
loadingContainer.style.display = '';

registerButton.addEventListener('touchend', (event) => {
    event.preventDefault();
    document.activeElement.blur();
    register();
});


function initializePage() {
    nameInput.style.display = 'none';
    nameLabel.style.display = 'none';
    registerButton.style.display = 'none';
};


window.onload = function () {
    // Check if the user is already registered
    const telegramData = window.Telegram.WebApp.initData;
    checkIfUserIsRegistered(telegramData);

    initializePage();

    // Ensure that the keyboard is closed when the user touches the screen outside of input elements
    document.addEventListener('touchstart', (event) => {
        if (!event.target.closest('input, textarea, select')) {
            event.preventDefault();
            document.activeElement.blur();
        };
    });
};


function checkIfUserIsRegistered(telegramData) {
    fetch('/common/check-registration', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ service: 'game', telegram_data: telegramData })  // Send the Telegram data as JSON
    })
    .then(response => response.json())
    .then(data => {
        if (data.registered) {
            // Redirect if the user is registered
            window.location.href = `../views/game_main.html?telegram_id=${encodeURIComponent(data.telegram_id)}`;
        } else {
            loadingContainer.style.display = 'none';
            registrationForm.style.display = 'flex';
        };
    })
    .catch(error => {
        console.error(`Error in checkIfUserIsRegistered: ${error}`);
    });
};


function register() {
    const name = nameInput.value.trim();
    const telegramData = window.Telegram.WebApp.initData;

    if (!name) {
        showModal('Пожалуйста, заполните все необходимые поля.');
        return;
    } else {
        const data = {
            name,
            telegram_data: telegramData,
            service: 'game'
        };
        
        fetch('/common/registration-attempt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Registration is successful
                showModal(data.message, true, data.telegram_id);
            } else {
                // Registration failed
                showModal(data.message, false, null);
            };
        })
        .catch(error => {
            console.error('Error:', error);
        });
    };
};


function showModal(message, isSuccess, telegramID) {
    const modal = document.getElementById('registration-modal');
    const modalOkButton = document.getElementById('modal-button');
    const modalMessage = document.getElementById('modal-message')

    modal.style.visibility = 'visible';
    modalMessage.textContent = message;

    modalOkButton.onclick = () => {
        modal.style.visibility = 'hidden';

        // If registration is successful, redirect
        if (isSuccess) {
            window.location.href = `game_main.html?telegram_id=${encodeURIComponent(telegramID)}`;  // Redirect if the user is registered
        };
    };
};


// Ensure the input field is scrolled into view
const inputs = document.querySelectorAll('input, textarea');
inputs.forEach((input) => {
    input.addEventListener('focus', () => {
        setTimeout(() => {
            input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    });
});
