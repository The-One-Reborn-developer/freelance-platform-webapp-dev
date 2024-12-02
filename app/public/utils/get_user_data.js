export function getUserData(telegram_id) {
    try {
        fetch('/get-user-data', {
            method: 'GET',
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