const customerButton = document.getElementById('customer_button');
const performerButton = document.getElementById('performer_button');


customerButton.addEventListener('click', chooseCustomer);
performerButton.addEventListener('click', choosePerformer);


function chooseCustomer() {
    if (performerButton.disabled) {
        performerButton.disabled = false;
        performerButton.style.backgroundColor = '';
    } else {
        performerButton.disabled = false;
        performerButton.style.backgroundColor = '';
        customerButton.style.backgroundColor = 'darkgrey';
    }
    customerButton.disabled = !performerButton.disabled;
    customerButton.style.backgroundColor = customerButton.disabled ? 'darkgrey' : '';
};


function choosePerformer() {
    if (customerButton.disabled) {
        customerButton.disabled = false;
        customerButton.style.backgroundColor = '';
    } else {
        customerButton.disabled = false;
        customerButton.style.backgroundColor = '';
        performerButton.style.backgroundColor = 'darkgrey';
    }
    performerButton.disabled = !customerButton.disabled;
    performerButton.style.backgroundColor = performerButton.disabled ? 'darkgrey' : '';
};


const registerButton = document.getElementById('register_button');


registerButton.addEventListener('click', register);


function register() {
    const role = customerButton.disabled ? 'customer' : 'performer';
    const name = document.getElementById('name_input').value;
    const rate = document.getElementById('rate_input').value;
    const experience = document.getElementById('experience_input').value;
    console.log(role, name, rate, experience)
}