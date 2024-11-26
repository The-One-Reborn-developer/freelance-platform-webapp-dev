const customerButton = document.getElementById('customer_button');
const performerButton = document.getElementById('performer_button');
const registerButton = document.getElementById('register_button');
const rateInput = document.getElementById('rate_input');
const rateLabel = document.getElementById('rate_label');
const experienceInput = document.getElementById('experience_input');
const experienceLabel = document.getElementById('experience_label');


customerButton.addEventListener('click', chooseCustomer);
performerButton.addEventListener('click', choosePerformer);
registerButton.addEventListener('click', register);


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
    const role = customerButton.disabled ? 'customer' : 'performer';
    const name = document.getElementById('name_input').value;
    const rate = document.getElementById('rate_input').value;
    const experience = document.getElementById('experience_input').value;

    const data = {
        role,
        name,
        rate,
        experience
    };
    
    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            console.log(data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
};