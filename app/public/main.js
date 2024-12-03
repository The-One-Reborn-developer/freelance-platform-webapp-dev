window.onload = async function () {
    const telegramID = getQueryParameter('telegram_id');
    if (telegramID) {
        try {
            const userData = await getUserData(telegramID);
            if (userData.userData.role === 'customer') {
                const name = userData.userData.name;

                insertCustomerButtons(name);
            } else {
                const name = userData.userData.name;
                const rate = userData.userData.rate;
                const experience = userData.userData.experience;

                insertPerformerButtons(name, rate, experience);
            }
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


function insertCustomerButtons(name) {
    const headerNav = document.getElementById('header-nav');
    const headerInfo = document.getElementById('header-user-info');

    if (!headerNav || !headerInfo) {
        console.error('Header navigation element not found');
        return;
    } else {
        try {
            headerInfo.innerHTML = `Заказчик ${name}`;

            const createBidButton = document.createElement('button');
            createBidButton.className = 'header-button';
            createBidButton.id = 'create-bid';
            createBidButton.textContent = 'Опубликовать новый заказ 🏷️';

            const myBidsButton = document.createElement('button');
            myBidsButton.className = 'header-button';
            myBidsButton.id = 'my-bids';
            myBidsButton.textContent = 'Просмотреть мои заказы 📂';

            const lookChatsButton = document.createElement('button');
            lookChatsButton.className = 'header-button';
            lookChatsButton.id = 'look-chats';
            lookChatsButton.textContent = 'Переписки по активным заказам 📨';

            headerNav.appendChild(createBidButton);
            headerNav.appendChild(myBidsButton);
            headerNav.appendChild(lookChatsButton);
        } catch (error) {
            console.error(`Error in insertCustomerButtons: ${error}`);
        };
    };
};


function insertPerformerButtons(name, rate, experience) {
    const headerNav = document.getElementById('header-nav');
    const headerInfo = document.getElementById('header-user-info');

    if (!headerNav || !headerInfo) {
        console.error('Header navigation element not found');
        return;
    } else {
        try {
            headerInfo.innerHTML = `Мастер ${name} (Ставка ${rate} ₽/час, ${experience} лет опыта)`;

            const searchBidsButton = document.createElement('button');
            searchBidsButton.className = 'header-button';
            searchBidsButton.id = 'search-bids';
            searchBidsButton.textContent = 'Искать заказы 🔎';

            const lookChatsButton = document.createElement('button');
            lookChatsButton.className = 'header-button';
            lookChatsButton.id = 'look-chats';
            lookChatsButton.textContent = 'Переписки по активным заказам 📨';

            const changeProfileInfoButton = document.createElement('button');
            changeProfileInfoButton.className = 'header-button';
            changeProfileInfoButton.id = 'change-profile-info';
            changeProfileInfoButton.textContent = 'Изменить информацию профиля 👤';

            headerNav.appendChild(searchBidsButton);
            headerNav.appendChild(lookChatsButton);
            headerNav.appendChild(changeProfileInfoButton);
        } catch (error) {
            console.error(`Error in insertPerformerButtons: ${error}`);
        };
    };
};