const customerButton = document.getElementById('customer_button');
const performerButton = document.getElementById('performer_button');

customerButton.addEventListener('click', chooseCustomer);
performerButton.addEventListener('click', choosePerformer);

function chooseCustomer() {
    if (performerButton.disabled) {
        performerButton.disabled = false;
        performerButton.style.backgroundColor = '';
    } else {
        performerButton.disabled = true;
        performerButton.style.backgroundColor = 'darkgrey';
    }
    customerButton.disabled = !performerButton.disabled;
    customerButton.style.backgroundColor = customerButton.disabled ? 'darkgrey' : '';
}

function choosePerformer() {
    if (customerButton.disabled) {
        customerButton.disabled = false;
        customerButton.style.backgroundColor = '';
    } else {
        customerButton.disabled = true;
        customerButton.style.backgroundColor = 'darkgrey';
    }
    performerButton.disabled = !customerButton.disabled;
    performerButton.style.backgroundColor = performerButton.disabled ? 'darkgrey' : '';
}
