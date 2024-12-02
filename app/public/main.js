window.onload = function () {
    const telegramID = getQueryParameter('telegram_id');
    console.log(telegramID);
    if (telegramID) {
        const userData = getUserData(telegramID);
        console.log(userData);
    };
};


function getQueryParameter(name) {
    const urlParameters = new URLSearchParams(window.location.search);
    return urlParameters.get(name);
};


function getUserData(telegram_id) {
    try {
        fetch('/get-user-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ telegram_id: telegram_id })  // Send the Telegram ID as JSON
        })
        .then(response => response.json())
        .then(data => {
            return data;
        })
        .catch(error => {
            console.error(`Error in getUserData: ${error}`);
        });
    } catch (error) {
        console.error('Error in getUserData:', error);
    };
}