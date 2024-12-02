const customerButton = document.getElementById('customer-button');
const performerButton = document.getElementById('performer-button');
const registerButton = document.getElementById('register-button');
const rateInput = document.getElementById('rate-input');
const rateLabel = document.getElementById('rate-label');
const experienceInput = document.getElementById('experience-input');
const experienceLabel = document.getElementById('experience-label');


customerButton.addEventListener('click', chooseCustomer);
performerButton.addEventListener('click', choosePerformer);
registerButton.addEventListener('click', register);


window.onload = function () {
    const telegramData = window.Telegram.WebApp.initData;

    // Check if the user is already registered
    checkIfUserIsRegistered(telegramData);
}


function checkIfUserIsRegistered(telegramData) {
    fetch('/check-registration', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ telegram_data: telegramData })  // Send the Telegram data as JSON
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = 'main.html';  // Redirect if the user is registered
        }
    })
    .catch(error => {
        console.error(`Error in checkIfUserIsRegistered: ${error}`);
    });
};


function chooseCustomer() {
    if (performerButton.disabled) {
        performerButton.disabled = false;
        performerButton.style.backgroundColor = '';

        rateInput.disabled = true;
        rateLabel.style.color = 'darkgrey';
        experienceInput.disabled = true;
        experienceLabel.style.color = 'darkgrey';
    } else {
        performerButton.disabled = false;
        performerButton.style.backgroundColor = '';
        customerButton.style.backgroundColor = 'darkgrey';

        rateInput.disabled = true;
        rateLabel.style.color = 'darkgrey';
        experienceInput.disabled = true;
        experienceLabel.style.color = 'darkgrey';
    }
    customerButton.disabled = !performerButton.disabled;
    customerButton.style.backgroundColor = customerButton.disabled ? 'darkgrey' : '';
};


function choosePerformer() {
    if (customerButton.disabled) {
        customerButton.disabled = false;
        customerButton.style.backgroundColor = '';

        rateInput.disabled = false;
        rateLabel.style.color = '';
        experienceInput.disabled = false;
        experienceLabel.style.color = '';
    } else {
        customerButton.disabled = false;
        customerButton.style.backgroundColor = '';
        performerButton.style.backgroundColor = 'darkgrey';
    }
    performerButton.disabled = !customerButton.disabled;
    performerButton.style.backgroundColor = performerButton.disabled ? 'darkgrey' : '';
};


function register() {
    const role = customerButton.disabled ? 'customer' : (performerButton.disabled ? 'performer' : null);
    const name = document.getElementById('name-input').value;
    const rate = document.getElementById('rate-input').value;
    const experience = document.getElementById('experience-input').value;
    const telegram_data = window.Telegram.WebApp.initData;

    if (!role || !name) {
        showModal('Пожалуйста, заполните все необходимые поля и выберите роль.');
        return;
    } else if (role === 'performer' && (!rate || !experience)) {
        showModal('Пожалуйста, заполните все необходимые поля и выберите роль.');
        return;
    }

    const data = {
        role,
        name,
        rate,
        experience,
        telegram_data
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
            showModal(data.message, true);
        } else {
            // Registration failed
            showModal(data.message, false);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
};


function showModal(message, isSuccess) {
    const modal = document.getElementById('registration-modal');
    const modalOkButton = document.getElementById('modal-button');
    const modalMessage = document.getElementById('modal-message')

    modal.style.visibility = 'visible';
    modalMessage.textContent = message;

    modalOkButton.onclick = () => {
        modal.style.visibility = 'hidden';

        // If registration is successful, redirect
        if (isSuccess) {
            window.location.href = 'main.html';
        };
    };
};