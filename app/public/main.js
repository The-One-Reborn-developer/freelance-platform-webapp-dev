window.onload = async function () {
    const telegramID = getQueryParameter('telegram_id');
    if (telegramID) {
        try {
            const userData = await getUserData(telegramID);
            if (userData) {
                console.log(userData);
                console.log(userData.data);
            };
        } catch (error) {
            console.error(`Error in window.onload: ${error}`);
        };
    };
};


function getQueryParameter(name) {
    const urlParameters = new URLSearchParams(window.location.search);
    return urlParameters.get(name);
};


async function getUserData(telegramID) {
    try {
        const response = await fetch('/get-user-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ telegram_id: telegramID })  // Send the Telegram ID as JSON
        })
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error in getUserData: ${error}`);
        return null
    };
};


function insertCustomerLabel(role, name) {
    const headerNav = document.getElementById('header-nav');

    if (!headerNav) {
        console.error('Header navigation element not found');
        return;
    } else {
        const label = document.createElement('customer-label');
        label.className = 'customer-label';
        label.textContent = `(${role}\n${name}`;

        headerNav.appendChild(label);
    };
};