window.Telegram.WebApp.disableVerticalSwipes()

const customerButton = document.getElementById('customer-button');
const performerButton = document.getElementById('performer-button');
const registerButton = document.getElementById('register-button');
const nameInput = document.getElementById('name-input');
const nameLabel = document.getElementById('name-label');
const rateInput = document.getElementById('rate-input');
const rateLabel = document.getElementById('rate-label');
const experienceInput = document.getElementById('experience-input');
const experienceLabel = document.getElementById('experience-label');

customerButton.addEventListener('click', chooseCustomer);
performerButton.addEventListener('click', choosePerformer);
registerButton.addEventListener('click', register);


function initializePage() {
    nameInput.style.display = 'none';
    nameLabel.style.display = 'none';
    rateInput.style.display = 'none';
    rateLabel.style.display = 'none';
    experienceInput.style.display = 'none';
    experienceLabel.style.display = 'none';
    registerButton.style.display = 'none';
};


window.onload = function () {
    initializePage();

    // Check if the user is already registered
    const telegramData = window.Telegram.WebApp.initData;
    checkIfUserIsRegistered(telegramData);

    // Ensure that the keyboard is closed when the user touches the screen outside of input elements
    document.addEventListener('touchstart', (event) => {
        if (!event.target.closest('input, textarea, select')) {
            document.activeElement.blur();
        };
    });    
};


function checkIfUserIsRegistered(telegramData) {
    fetch('/check-registration', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ service: 'services', telegram_data: telegramData })  // Send the Telegram data as JSON
    })
    .then(response => response.json())
    .then(data => {
        if (data.registered) {
            // Redirect if the user is registered
            window.location.href = `../views/services_main.html?telegram_id=${encodeURIComponent(data.telegram_id)}`;
        };
    })
    .catch(error => {
        console.error(`Error in checkIfUserIsRegistered: ${error}`);
    });
};


function chooseCustomer() {
    // Show only the name input and label
    nameInput.style.display = '';
    nameLabel.style.display = '';
    rateInput.style.display = 'none';
    rateLabel.style.display = 'none';
    experienceInput.style.display = 'none';
    experienceLabel.style.display = 'none';
    registerButton.style.display = '';

    // Highlight the selected button
    customerButton.style.backgroundColor = 'darkgrey';
    performerButton.style.backgroundColor = '';
};


function choosePerformer() {
    // Show name, rate, and experience inputs and labels
    nameInput.style.display = '';
    nameLabel.style.display = '';
    rateInput.style.display = '';
    rateLabel.style.display = '';
    experienceInput.style.display = '';
    experienceLabel.style.display = '';
    registerButton.style.display = '';

    // Highlight the selected button
    performerButton.style.backgroundColor = 'darkgrey';
    customerButton.style.backgroundColor = '';
};


function register() {
    const role = customerButton.style.backgroundColor === 'darkgrey' ? 'customer' : 'performer';
    const name = nameInput.value.trim();
    const rate = rateInput.value.trim();
    const experience = experienceInput.value.trim();
    const telegramData = window.Telegram.WebApp.initData;

    if (!name || (role === 'performer' && (!rate || !experience))) {
        showModal('Пожалуйста, заполните все необходимые поля.');
        return;
    } else {
        const data = {
            role,
            name,
            rate,
            experience,
            telegram_data: telegramData,
            service: 'services'
        };
        
        fetch('/registration-attempt', {
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
            window.location.href = `services_main.html?telegram_id=${encodeURIComponent(telegramID)}`;  // Redirect if the user is registered
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