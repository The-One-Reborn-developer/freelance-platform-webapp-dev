import { 
    fileToBase64,
    scrollToBottom,
    scrollInputsIntoView,
    initializeWebSocket,
    getQueryParameter,
    getUserData
} from "./modules/common_index.mjs";

import {
    fetchPerformers,
    fetchCustomers,
    showModal
} from "./modules/services_index.mjs";


window.onload = async function () {
    window.Telegram.WebApp.disableVerticalSwipes()

    const telegramID = getQueryParameter('telegram_id');
    if (telegramID) {
        try {
            const userData = await getUserData(telegramID);
            const validatedTelegramID = userData.userData.telegram_id;
            const role = userData.userData.services_role;
            const socket = initializeWebSocket(validatedTelegramID);

            if (role === 'customer') {
                setupCustomerInterface(validatedTelegramID, userData, socket);
            } else {
                setupPerformerInterface(validatedTelegramID, userData, socket);
            };
        } catch (error) {
            console.error(`Error in window.onload: ${error}`);
        };
    };

    // Ensure that the keyboard is closed when the user touches the screen outside of input elements
    document.addEventListener('touchstart', (event) => {
        if (!event.target.closest('input, textarea, select')) {
            document.activeElement.blur();
        };
    });
};


function setupCustomerInterface(validatedTelegramID, userData, socket) {
    const name = userData.userData.services_name;
    const registrationDate = userData.userData.services_registration_date;

    insertCustomerButtons(name, registrationDate);

    const createBidButton = document.getElementById('create-bid');
    createBidButton.addEventListener('click', async function () {
        await showCreateBidForm();

        // Attach submit form event listener
        const createBidForm = document.getElementById('create-bid-form');
        if (createBidForm) {
            createBidForm.addEventListener('touchend', async function (event) {
                const target = event.target;

                if (target && target.id === "create-bid-button") {
                    event.preventDefault();
                    document.activeElement.blur();
                    handleBidFormSubmit(event, validatedTelegramID, name);
                };
            });
        };
    });

    const myBidsButton = document.getElementById('my-bids');
    myBidsButton.addEventListener('click', async function () {
        await showMyBids(validatedTelegramID);
    });

    const lookChatsButton = document.getElementById('look-chats');
    lookChatsButton.addEventListener('click', async function () {
        const display = document.getElementById('display');
        display.classList.remove('view-mode');

        await showCustomerChats(validatedTelegramID, name, socket);
    });
};


function insertCustomerButtons(name, registrationDate) {
    const headerNav = document.getElementById('header-nav');
    const headerInfo = document.getElementById('header-user-info');

    if (!headerNav || !headerInfo) {
        console.error('Header navigation element not found');
        return;
    } else {
        try {
            headerInfo.innerHTML = `Заказчик ${name}. Зарегистрирован ${registrationDate}.`;

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
            lookChatsButton.textContent = 'Переписки по активным заказам 📩';

            headerNav.appendChild(createBidButton);
            headerNav.appendChild(myBidsButton);
            headerNav.appendChild(lookChatsButton);
        } catch (error) {
            console.error(`Error in insertCustomerButtons: ${error}`);
        };
    };
};


function insertPerformerButtons(name, rate, experience, registrationDate) {
    const headerNav = document.getElementById('header-nav');
    const headerInfo = document.getElementById('header-user-info');

    if (!headerNav || !headerInfo) {
        console.error('Header navigation element not found');
        return;
    } else {
        try {
            headerInfo.innerHTML = `Исполнитель ${name}. Ставка ${rate} (₽/час), ${experience} (лет опыта). Зарегистрирован ${registrationDate}`;

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


async function showCreateBidForm() {
    const display = document.getElementById('display');
    if (!display) {
        console.error('Display element not found');
        return;
    } else {
        try {
            display.innerHTML = '';

            const response = await fetch('../templates/create_bid_form.html');

            if (!response.ok) {
                display.textContent = 'Произошла ошибка при загрузке формы создания заказа, попробуйте перезайти в приложение';
                console.error('Failed to load create_bid_form.html');
            } else {
                const formHTML = await response.text();

                display.innerHTML = formHTML;

                scrollInputsIntoView();
            };
        } catch (error) {
            console.error(`Error in showCreateBidForm: ${error}`);
        };
    };
};


function handleBidFormSubmit(event, validatedTelegramID, name) {
    event.preventDefault();

    const description = document.getElementById('description-textarea');
    const deadlineFrom = document.getElementById('deadline-from');
    const deadlineTo = document.getElementById('deadline-to');
    const instrumentProvidedTrue = document.getElementById('instrument-provided-true');
    const instrumentProvidedFalse = document.getElementById('instrument-provided-false');
    const instrumentProvided = document.querySelector('input[name="instrument-provided"]:checked');

    // Check if the fields are valid
    if (!description.value || !deadlineFrom.value || !deadlineTo.value || !instrumentProvided) {
        showModal('Пожалуйста, заполните всю форму.');
        return;
    } else {
        const data = {
            customer_telegram_id: validatedTelegramID,
            customer_name: name,
            city: city.value,
            description: description.value,
            deadline_from: deadlineFrom.value,
            deadline_to: deadlineTo.value,
            instrument_provided: instrumentProvided.value
        };

        try {
            fetch('/services/post-bid', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        description.value = '';
                        deadlineFrom.value = '';
                        deadlineTo.value = '';
                        instrumentProvidedTrue.checked = false;
                        instrumentProvidedFalse.checked = false;
                        showModal(data.message);
                    } else {
                        showModal('Произошла ошибка при создании заказа. Попробуйте позже.');
                    }
                })
                .catch((error) => {
                    console.error(`Error in handleBidFormSubmit: ${error}`);
                    showModal('Произошла ошибка при создании заказа. Попробуйте позже.');
                });
        } catch (error) {
            console.error(`Error in handleBidFormSubmit: ${error}`);
            showModal('Произошла ошибка при создании заказа. Попробуйте позже.');
        };
    };
};


async function showMyBids(validatedTelegramID) {
    const display = document.getElementById('display');
    if (!display) {
        console.error('Display element not found');
        return;
    } else {
        try {
            display.innerHTML = '';

            const response = await fetch('/services/my-bids', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ customer_telegram_id: validatedTelegramID })  // Send the Telegram ID as JSON
            });

            if (!response.ok) {
                showModal('Произошла ошибка при загрузке списка заказов, попробуйте перезайти в приложение');
                console.error(`Error in /services/my-bids: ${response}`);
            };

            const { success, bids } = await response.json();

            if (success && bids.length > 0) {
                const bidsContainer = document.createElement('div');
                bidsContainer.classList.add('bids-container');

                bids.forEach((bid) => {
                    const bidCard = document.createElement('div');
                    bidCard.classList.add('bid-card');

                    bidCard.innerHTML = `
                        <h3>Заказ #${bid.id}</h3>
                        <br>
                        <p>Город: ${bid.city}</p>
                        <br>
                        <p>Описание: ${bid.description}</p>
                        <br>
                        <p>Срок от: ${bid.deadline_from}</p>
                        <p>Срок до: ${bid.deadline_to}</p>
                        <br>
                        <p>Предоставляется инструмент: ${(bid.instrument_provided === 1) ? 'Да' : 'Нет'}</p>
                        <button class="bid-card-button" data-bid-id="${bid.id}">Закрыть заказ 🔐</button>
                    `;

                    const closeBidButton = bidCard.querySelector('.bid-card-button');
                    closeBidButton.addEventListener('click', async (event) => {
                        const bidID = event.target.getAttribute('data-bid-id');

                        if (bidID) {
                            const confirmation = confirm('Вы уверены, что хотите закрыть заказ?');
                            if (confirmation) {
                                try {
                                    const response = await fetch('/services/close-bid', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({ bid_id: bidID })
                                    });

                                    if (!response.ok) {
                                        showModal('Произошла ошибка при закрытии заказа, попробуйте перезайти в приложение');
                                        console.error('Failed to close bid');
                                    } else {
                                        const { success, message } = await response.json();
                                        if (success) {
                                            showModal(message);
                                            showMyBids(validatedTelegramID);
                                        };
                                    };
                                } catch (error) {
                                    console.error(`Error in /services/close-bid: ${error}`);
                                };
                            };
                        };
                    });
                    bidsContainer.appendChild(bidCard);
                });
                display.appendChild(bidsContainer);
            } else {
                showModal('У вас нет активных заказов.');
            };
        } catch (error) {
            console.error(`Error in showMyBids: ${error}`);
        };
    };
};


async function showSelectCityForm() {
    const display = document.getElementById('display');
    if (!display) {
        console.error('Display element not found');
        return;
    } else {
        try {
            display.innerHTML = '';

            const response = await fetch('../templates/select_city.html');

            if (!response.ok) {
                showModal('Произошла ошибка при загрузке списка заказов, попробуйте перезайти в приложение');
                console.error('Failed to load select_city.html');
            };

            const formHTML = await response.text();

            display.innerHTML = formHTML;
        } catch (error) {
            console.error(`Error in showSelectCityForm: ${error}`);
        };
    };
};


async function handleCityFormSubmit(event, validatedTelegramID) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const city = formData.get('city');

    if (city) {
        await showBids(city, validatedTelegramID);
    };
};


async function showBids(city, validatedTelegramID) {
    const display = document.getElementById('display');
    if (!display) {
        console.error('Display element not found');
        return;
    } else {
        try {
            display.innerHTML = '';

            const response = await fetch('/services/get-bids', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ city: city })  // Send the city as JSON
            });

            if (!response.ok) {
                showModal('Произошла ошибка при загрузке списка заказов, попробуйте перезайти в приложение');
                console.error(`Error in /services/get-bids: ${response}`);
            };

            const bidsResponse = await response.json();

            if (bidsResponse && bidsResponse.bids.length > 0) {
                const bidsContainer = document.createElement('div');
                bidsContainer.classList.add('bids-container');

                bidsResponse.bids.forEach(bid => {
                    const bidCard = document.createElement('div');
                    bidCard.classList.add('bid-card');

                    bidCard.innerHTML = `
                        <p>Заказчик: ${bid.customer_name}</p>
                        <br>
                        <p>Описание: ${bid.description}</p>
                        <br>
                        <p>Срок от: ${bid.deadline_from}</p>
                        <p>Срок до: ${bid.deadline_to}</p>
                        <br>
                        <p>Предоставляется инструмент: ${(bid.instrument_provided === 1) ? 'Да' : 'Нет'}</p>
                        <button id="respond-to-bid" class="bid-card-button" data-bid-id="${bid.id}">Откликнуться ☑️</button>
                        <button id="look-chats" class="bid-card-button">Посмотреть переписки заказчика 📤</button>
                    `;

                    bidCard.querySelector('#respond-to-bid').addEventListener('click', async (event) => {
                        const bidID = event.target.getAttribute('data-bid-id');

                        if (bidID) {
                            try {
                                fetch('/services/respond-to-bid', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({ bid_id: bidID, performer_telegram_id: validatedTelegramID })
                                })
                                    .then(response => response.json())
                                    .then(data => {
                                        if (data.success) {
                                            showModal(data.message);
                                            showBids(city, validatedTelegramID);
                                        };
                                    })
                                    .catch(error => {
                                        console.error(`Error in /services/respond-to-bid: ${error}`);
                                        showModal('Произошла ошибка при отклике на заказ, попробуйте перезайти в приложение');
                                    });
                            } catch (error) {
                                console.error(`Error in /services/respond-to-bid: ${error}`);
                                showModal('Произошла ошибка при отклике на заказ, попробуйте перезайти в приложение');
                            };
                        };
                    });

                    bidCard.querySelector('#look-chats').addEventListener('click', async (event) => {
                        const customerTelegramID = bid.customer_telegram_id

                        if (customerTelegramID) {
                            showCustomerChatsWithPerformers(customerTelegramID);
                        } else {
                            showModal('Произошла ошибка при загрузке переписки, попробуйте перезайти в приложение');
                            console.error('Customer Telegram ID not found');
                        };
                    });

                    bidsContainer.appendChild(bidCard);
                });
                display.appendChild(bidsContainer);
            } else {
                display.innerHTML = `<p>В данном городе нет активных заказов</p>`;
            };
        } catch (error) {
            console.error(`Error in showBids: ${error}`);
        };
    };
};


function showCustomerChatsWithPerformers(customerTelegramID) {
    const display = document.getElementById('display');
    if (!display) {
        console.error('Display element not found');
        return;
    } else {
        try {
            display.innerHTML = '';
            display.innerHTML = 'Загрузка...';
            fetch('/services/show-customer-chats-list', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ customer_telegram_id: customerTelegramID })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success && Array.isArray(data.bids)) {
                        display.innerHTML = '';

                        const bidsContainer = document.createElement('div');
                        bidsContainer.classList.add('bids-container');

                        data.bids.forEach(bid => {
                            const bidCard = document.createElement('div');
                            bidCard.classList.add('bid-card');

                            bidCard.innerHTML = `
                            <p>Номер заказа: ${bid.id}</p>
                            <p>Город: ${bid.city}</p>
                            <p>Описание: ${bid.description}</p>
                            <p>Срок от: ${bid.deadline_from}</p>
                            <p>Срок до: ${bid.deadline_to}</p>
                            <p>Предоставляется инструмент: ${(bid.instrument_provided === 1 || bid.instrument_provided === true) ? 'Да' : 'Нет'}</p>
                            <br><br>
                        `;

                            bid.responses.forEach((response) => {
                                const responseDetails = `
                                <div class="response-container">
                                    <p>Откликнулся: ${response.performer_name}</p>
                                    <p>Ставка: ${response.performer_rate} (₽/час)</p>
                                    <p>Стаж: ${response.performer_experience} (в годах)</p>
                                </div>
                            `;

                                const lookChatButton = document.createElement('button');
                                lookChatButton.classList.add('bid-card-button');
                                lookChatButton.innerHTML = 'Посмотреть переписку 👀';
                                lookChatButton.setAttribute('data-bid-id', bid.id);
                                lookChatButton.setAttribute('data-customer-telegram-id', customerTelegramID);
                                lookChatButton.setAttribute('data-performer-telegram-id', response.performer_telegram_id);

                                lookChatButton.addEventListener('click', async (event) => {
                                    const bidID = event.target.getAttribute('data-bid-id');
                                    const customerTelegramID = event.target.getAttribute('data-customer-telegram-id');
                                    const performerTelegramID = event.target.getAttribute('data-performer-telegram-id');
                                    if (bidID && customerTelegramID && performerTelegramID) {
                                        await showSelectedCustomerChat(bidID, customerTelegramID, performerTelegramID);
                                    } else {
                                        showModal('Произошла ошибка при загрузке переписки, попробуйте перезайти в приложение.');
                                        console.error('Bid ID, Customer Telegram ID, or Performer Telegram ID not found');
                                    };
                                });

                                bidCard.innerHTML += responseDetails;
                                bidCard.appendChild(lookChatButton);
                            });

                            bidsContainer.appendChild(bidCard);
                        });

                        display.appendChild(bidsContainer);
                    } else {
                        showModal('У данного заказчика ещё нет переписок');
                    };
                })
                .catch(error => {
                    console.error(`Error in showCustomerChatsWithPerformers: ${error}`);
                });
        } catch (error) {
            console.error(`Error in showCustomerChatsWithPerformers: ${error}`);
        };
    };
};


async function showSelectedCustomerChat(bidID, customerTelegramID, performerTelegramID) {
    const display = document.getElementById('display');
    display.classList.add('view-mode');

    display.innerHTML = '';
    display.innerHTML = 'Загрузка...';

    const chatHistory = document.createElement('div');
    chatHistory.classList.add('chat-history');
    chatHistory.classList.add('view-mode');

    if (!display) {
        console.error('Display element not found');
        return;
    } else {
        try {
            const response = await fetch(
                `/services/get-chats?bid_id=${bidID}&customer_telegram_id=${customerTelegramID}&performer_telegram_id=${performerTelegramID}`
            );
            const data = await response.json();

            if (data.success && Array.isArray(data.chatMessages) && data.chatMessages.length > 0) {
                // Use Promise.all to resolve all async operations in the .map()
                const messagesHtml = await Promise.all(
                    data.chatMessages
                        // Filter out empty messages
                        .filter((msg) => msg.trim() !== '')
                        // Replace '\n' with <br>
                        .map(async (msg) => {
                            if (msg.includes('app/chats/services/attachments/')) {
                                // Extract sender, attachment path, and timestamp
                                const [senderLine, attachmentString, timestamp] = msg.split('\n').filter(line => line.trim() !== '');
                                const attachmentUrl = attachmentString.replace('app/chats/services/attachments/', '/services/attachments/');

                                const customerName = await fetch('/common/get-user-data', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({ telegram_id: customerTelegramID })
                                })
                                    .then(response => response.json())
                                    .then(data => data.userData.name);
                                const performerName = await fetch('/common/get-user-data', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({ telegram_id: performerTelegramID })
                                })
                                    .then(response => response.json())
                                    .then(data => data.userData.services_name);

                                const senderName = senderLine.includes('Заказчик')
                                    ? `Заказчик ${customerName}:`
                                    : `Исполнитель ${performerName}:`;

                                // Render the message with attachment
                                return `<div class="chat-message">
                                            ${senderName}<br><br>
                                            <img src="${attachmentUrl}" alt="Attachment" class="attachment-image">
                                            <br><br>
                                            ${timestamp}
                                        </div>`
                            } else {
                                return `<div class="chat-message">${msg.replace(/\n/g, '<br>')}</div>`
                            };
                        })
                );

                chatHistory.innerHTML = messagesHtml.join('');
            } else {
                showModal('Произошла ошибка при загрузке переписки, попробуйте перезайти в приложение.');
            };

            display.innerHTML = '';
            display.appendChild(chatHistory);
        } catch (error) {
            console.error(`Error in showSelectedCustomerChat: ${error}`);
        };
    };
};


function setupPerformerInterface(validatedTelegramID, userData, socket) {
    const name = userData.userData.services_name;
    const rate = userData.userData.rate;
    const experience = userData.userData.experience;
    const registrationDate = userData.userData.services_registration_date;

    insertPerformerButtons(name, rate, experience, registrationDate);

    const searchBidsButton = document.getElementById('search-bids');
    searchBidsButton.addEventListener('click', async function () {
        await showSelectCityForm();

        // Attach submit form event listener
        const selectCityForm = document.getElementById('select-city-form');
        if (selectCityForm) {
            selectCityForm.addEventListener('submit', async function (event) {
                await handleCityFormSubmit(event, validatedTelegramID);
            });
        };
    });

    const lookChatsButton = document.getElementById('look-chats');
    lookChatsButton.addEventListener('click', async function () {
        const display = document.getElementById('display');
        display.classList.remove('view-mode');

        await showPerformerChats(validatedTelegramID, name, socket);
    });

    const changeProfileInfoButton = document.getElementById('change-profile-info');
    changeProfileInfoButton.addEventListener('click', async function () {
        await showChangeProfileInfoForm();

        // Attach submit form event listener
        const changeProfileInfoForm = document.getElementById('change-profile-info-form');
        if (changeProfileInfoForm) {
            changeProfileInfoForm.addEventListener('submit', async function (event) {
                await handleProfileInfoFormSubmit(name, event, validatedTelegramID, registrationDate);
            });
        };
    });
};


async function showPerformerChats(validatedTelegramID, name, socket) {
    // Fetch the list of customers who wrote to the performer
    try {
        const customers = await fetchCustomers(validatedTelegramID);

        if (customers.length === 0) {
            showModal('На Ваши отклики ещё никто не написал.');
            return;
        } else {
            // Create the chat interface
            const response = await fetch('../templates/chat_window.html');
            display.innerHTML = await response.text(); // Properly inject the fetched HTML content

            // Populate the customer buttons
            const customerList = document.getElementById('user-list');
            const chatInput = document.getElementById('chat-input');

            customers.forEach((customer) => {
                const button = document.createElement('button');
                button.innerHTML = `${customer.name}`;
                button.addEventListener('click', () => {
                    loadPerformerChatHistory(validatedTelegramID, name, customer, socket)
                    chatInput.classList.remove('hidden');
                });
                customerList.appendChild(button);
            });

            scrollInputsIntoView();
        };
    } catch (error) {
        console.error(`Error in showPerformerChats: ${error}`);
    };
};


async function loadPerformerChatHistory(validatedTelegramID, name, customer, socket) {
    const chatHistory = document.getElementById('chat-history');

    // Clear the chat history
    chatHistory.innerHTML = '';
    chatHistory.innerHTML = 'Загрузка...';

    try {
        // Fetch the chat history
        const response = await fetch(
            `/services/get-chats?bid_id=${customer.bidID}&customer_telegram_id=${customer.telegramID}&performer_telegram_id=${validatedTelegramID}`
        );
        const data = await response.json();

        if (data.success && Array.isArray(data.chatMessages) && data.chatMessages.length > 0) {
            chatHistory.innerHTML = data.chatMessages
                // Filter out empty messages
                .filter((msg) => msg.trim() !== '')
                // Replace '\n' with <br>
                .map((msg) => {
                    if (msg.includes('app/chats/services/attachments/')) {
                        // Extract sender and timestamp
                        const [senderLine, attachmentString, timestamp] = msg.split('\n').filter(line => line.trim() !== '');
                        const attachmentUrl = attachmentString.replace('app/chats/services/attachments/', '/services/attachments/');
                        const senderName = senderLine.includes('Заказчик')
                            ? `Заказчик ${customer.name}:`
                            : `Исполнитель ${name}:`;

                        // Render the message with attachment
                        return `<div class="chat-message">
                                    ${senderName}<br><br>
                                    <img src="${attachmentUrl}" alt="Attachment" class="attachment-image">
                                    <br><br>
                                    ${timestamp}
                                </div>`
                    } else {
                        return `<div class="chat-message">${msg.replace(/\n/g, '<br>')}</div>`
                    };
                })
                .join('');
        } else {
            chatHistory.innerHTML = 'Нет сообщений.';
        };
    } catch (error) {
        console.error(`Error in loadPerformerChatHistory: ${error}`);
        chatHistory.innerHTML = 'Произошла ошибка при загрузке сообщений.';
    };

    // Attach event listener for sending messages
    const sendButton = document.getElementById('send-button');
    sendButton.addEventListener('touchend', async (event) => {
        event.preventDefault();
        document.activeElement.blur();

        const messageTextArea = document.getElementById('message-input');
        const message = messageTextArea.value.trim();

        if (message) {
            // Send the message to the server to save and to route to Telegram
            const response = await fetch('/services/send-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    bid_id: customer.bidID,
                    customer_telegram_id: customer.telegramID,
                    performer_telegram_id: validatedTelegramID,
                    message,
                    sender_type: 'performer'
                })
            });
            // Send the message through the WebSocket to be displayed on the other side
            if (socket && socket.readyState === WebSocket.OPEN) {
                const messageData = {
                    recipient_telegram_id: customer.telegramID,
                    sender_name: name,
                    message,
                    attachment: null
                };
                console.log(`Message data: ${JSON.stringify(messageData)}`);

                socket.send(JSON.stringify(messageData));
            };

            if (response.ok) {
                const currentDate = new Date().toLocaleString();

                const chatHistory = document.getElementById('chat-history');

                chatHistory.innerHTML += `<div class="chat-message">
                                            Исполнитель ${name}:
                                            <br><br>${message}
                                            <br><br>${currentDate}
                                            </div>`;

                messageTextArea.value = '';
                const display = document.getElementById('display');
                scrollToBottom(display);
            };
        };
    });

    const attachmentInput = document.getElementById('attachment-input');
    const attachmentButton = document.getElementById('attachment-button');
    attachmentButton.onclick = () => {
        attachmentInput.click();
    };

    attachmentInput.addEventListener('change', async () => {
        const file = attachmentInput.files[0];

        if (file) {
            const formData = new FormData();
            formData.append('attachment', file);
            formData.append('bid_id', customer.bidID);
            formData.append('customer_telegram_id', customer.telegramID);
            formData.append('performer_telegram_id', validatedTelegramID);
            formData.append('sender_type', 'performer');

            try {
                const response = await fetch('/services/send-message', {
                    method: 'POST',
                    body: formData
                });

                // Send the file through the WebSocket to be displayed on the other side
                const base64File = await fileToBase64(file);

                if (socket && socket.readyState === WebSocket.OPEN) {
                    const messageData = {
                        recipient_telegram_id: customer.telegramID,
                        sender_name: name,
                        message: '[File sent]',
                        attachment: base64File
                    };

                    socket.send(JSON.stringify(messageData));
                };

                if (response.ok) {
                    const currentDate = new Date().toLocaleString();
                    const chatHistory = document.getElementById('chat-history');

                    chatHistory.innerHTML += `<div class="chat-message">
                                                Исполнитель ${name}:
                                                <br><br><img src="${URL.createObjectURL(file)}" alt="Attachment" class="attachment-image">
                                                <br><br>${currentDate}
                                              </div>`;

                    const display = document.getElementById('display');
                    scrollToBottom(display);
                };
            } catch (error) {
                console.error(`Error in sendAttachment: ${error}`);
                showModal('Произошла ошибка при отправке файла');
            };
        };
    });
};


async function showCustomerChats(validatedTelegramID, name, socket) {
    // Fetch the list of performers who responded to the customer's bids
    try {
        const performers = await fetchPerformers(validatedTelegramID);

        if (performers.length === 0) {
            showModal('На Ваши заявки ещё никто не откликался.');
            return;
        } else {
            // Create the chat interface
            const response = await fetch('../templates/chat_window.html');
            display.innerHTML = await response.text(); // Properly inject the fetched HTML content

            // Populate the performer buttons
            const performerList = document.getElementById('user-list');
            const chatInput = document.getElementById('chat-input');

            performers.forEach((performer) => {
                const performerParagraph = document.createElement('p');
                performerParagraph.innerHTML =
                    `${performer.name}. Зарегистрирован ${performer.registration_date}.
                    Ставка: ${performer.rate}/час, опыт: ${performer.experience} (в годах)`;

                const chatButton = document.createElement('button');
                chatButton.innerHTML = 'Написать исполнителю 📩';
                chatButton.addEventListener('click', () => {
                    loadCustomerChatHistory(validatedTelegramID, name, performer, socket)
                    chatInput.classList.remove('hidden');
                });

                const lookPerformerChatsButton = document.createElement('button');
                lookPerformerChatsButton.innerHTML = 'Посмотреть переписки исполнителя 📤';
                lookPerformerChatsButton.addEventListener('click', () => showPerformerChatsWithCustomers(performer.telegramID));

                performerList.appendChild(performerParagraph);
                performerList.appendChild(chatButton);
                performerList.appendChild(lookPerformerChatsButton);
            });

            scrollInputsIntoView();
        };
    } catch (error) {
        console.error(`Error in showCustomerChats: ${error}`);
    };
};


function showPerformerChatsWithCustomers(performerTelegramID) {
    const display = document.getElementById('display');
    display.innerHTML = '';
    if (!display) {
        console.error('Display element not found');
        return;
    } else {
        try {
            display.innerHTML = '';
            display.innerHTML = 'Загрузка...';
            fetch('/services/show-performer-chats-list', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ performer_telegram_id: performerTelegramID })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success && Array.isArray(data.bids)) {
                        display.innerHTML = '';

                        const responsesContainer = document.createElement('div');
                        responsesContainer.classList.add('bid-container');

                        data.bids.forEach(item => {
                            const bid = item.bid;

                            const responseCard = document.createElement('div');
                            responseCard.classList.add('bid-card');

                            responseCard.innerHTML = `
                        <p>Номер заказа: ${bid.id}</p>
                        <p>Город: ${bid.city}</p>
                        <p>Заказчик: ${bid.customer_name}</p>
                        <p>Описание: ${bid.description}</p>
                        <p>Срок от: ${bid.deadline_from}</p>
                        <p>Срок до: ${bid.deadline_to}</p>
                        <p>Предоставляется инструмент: ${(bid.instrument_provided === 1 || bid.instrument_provided === true) ? 'Да' : 'Нет'}</p>
                        `;

                            const responseButton = document.createElement('button');
                            responseButton.classList.add('bid-card-button');
                            responseButton.innerHTML = 'Посмотреть переписку 👀';
                            responseButton.setAttribute('data-bid-id', bid.id);
                            responseButton.setAttribute('data-customer-telegram-id', bid.customer_telegram_id);
                            responseButton.setAttribute('data-performer-telegram-id', performerTelegramID);

                            responseButton.addEventListener('click', async (event) => {
                                const bidID = event.target.getAttribute('data-bid-id');
                                const customerTelegramID = event.target.getAttribute('data-customer-telegram-id');
                                const performerTelegramID = event.target.getAttribute('data-performer-telegram-id');

                                if (bidID && customerTelegramID && performerTelegramID) {
                                    await showSelectedPerformerChat(bidID, customerTelegramID, performerTelegramID);
                                } else {
                                    showModal('Произошла ошибка при загрузке переписки, попробойте перезайти в приложение.');
                                    console.error('Invalid bid ID, customer Telegram ID, or performer Telegram ID');
                                }
                            });

                            responseCard.appendChild(responseButton);
                            responsesContainer.appendChild(responseCard);
                        });

                        display.appendChild(responsesContainer);
                    } else {
                        showModal('У данного исполнителя ещё нет переписок');
                    };
                })
                .catch(error => {
                    console.error(`Error in showPerformerChatsWithCustomers: ${error}`);
                    showModal('Произошла ошибка при загрузке списка заказов, попробуйте перезайти в приложение');
                });
        } catch (error) {
            showModal('Произошла ошибка при загрузке списка заказов, попробуйте перезайти в приложение');
            console.error(`Error in showPerformerChatsWithCustomers: ${error}`);
        };
    };
};


async function showSelectedPerformerChat(bidID, customerTelegramID, performerTelegramID) {
    const display = document.getElementById('display');
    display.classList.add('view-mode');

    display.innerHTML = '';
    display.innerHTML = 'Загрузка...';

    const chatHistory = document.createElement('div');
    chatHistory.classList.add('chat-history');
    chatHistory.classList.add('view-mode');

    if (!display) {
        console.error('Display element not found');
        return;
    } else {
        try {
            display.innerHTML = '';
            display.innerHTML = 'Загрузка...';

            const response = await fetch(
                `/services/get-chats?bid_id=${bidID}&customer_telegram_id=${customerTelegramID}&performer_telegram_id=${performerTelegramID}`
            );
            const data = await response.json();

            if (data.success && Array.isArray(data.chatMessages) && data.chatMessages.length > 0) {
                // Use Promise.all to resolve all async operations in the .map()
                const messagesHtml = await Promise.all(
                    data.chatMessages
                        // Filter out empty messages
                        .filter((msg) => msg.trim() !== '')
                        // Replace '\n' with <br>
                        .map(async (msg) => {
                            if (msg.includes('app/chats/services/attachments/')) {
                                // Extract sender, attachment path, and timestamp
                                const [senderLine, attachmentString, timestamp] = msg.split('\n').filter(line => line.trim() !== '');
                                const attachmentUrl = attachmentString.replace('app/chats/services/attachments/', '/services/attachments/');

                                const customerName = await fetch('/common/get-user-data', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({ telegram_id: customerTelegramID })
                                })
                                    .then(response => response.json())
                                    .then(data => data.userData.services_name);
                                const performerName = await fetch('/common/get-user-data', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({ telegram_id: performerTelegramID })
                                })
                                    .then(response => response.json())
                                    .then(data => data.userData.services_name);

                                const senderName = senderLine.includes('Заказчик')
                                    ? `Заказчик ${customerName}:`
                                    : `Исполнитель ${performerName}:`;

                                // Render the message with attachment
                                return `<div class="chat-message">
                                            ${senderName}<br><br>
                                            <img src="${attachmentUrl}" alt="Attachment" class="attachment-image">
                                            <br><br>
                                            ${timestamp}
                                        </div>`
                            } else {
                                return `<div class="chat-message">${msg.replace(/\n/g, '<br>')}</div>`
                            };
                        })
                );

                chatHistory.innerHTML = messagesHtml.join('');
            } else {
                showModal('Произошла ошибка при загрузке переписки, попробуйте перезайти в приложение.');
            };

            display.innerHTML = '';
            display.appendChild(chatHistory);
        } catch (error) {
            showModal('Произошла ошибка при загрузке переписки, попробуйте перезайти в приложение.');
            console.error(`Error in showSelectedPerformerChat: ${error}`);
        };
    };
};


async function loadCustomerChatHistory(validatedTelegramID, name, performer, socket) {
    const chatHistory = document.getElementById('chat-history');

    // Clear the chat history
    chatHistory.innerHTML = '';
    chatHistory.innerHTML = 'Загрузка...';

    try {
        // Fetch the chat history
        const response = await fetch(
            `/services/get-chats?bid_id=${performer.bidID}&customer_telegram_id=${validatedTelegramID}&performer_telegram_id=${performer.telegramID}`
        );
        const data = await response.json();

        if (data.success && Array.isArray(data.chatMessages) && data.chatMessages.length > 0) {
            chatHistory.innerHTML = data.chatMessages
                // Filter out empty messages
                .filter((msg) => msg.trim() !== '')
                // Replace '\n' with <br>
                .map((msg) => {
                    if (msg.includes('app/chats/services/attachments/')) {
                        // Extract sender, attachment path, and timestamp
                        const [senderLine, attachmentString, timestamp] = msg.split('\n').filter(line => line.trim() !== '');
                        const attachmentUrl = attachmentString.replace('app/chats/services/attachments/', '/services/attachments/');
                        const senderName = senderLine.includes('Заказчик')
                            ? `Заказчик ${name}:`
                            : `Исполнитель ${performer.name}:`;

                        // Render the message with attachment
                        return `<div class="chat-message">
                                    ${senderName}<br><br>
                                    <img src="${attachmentUrl}" alt="Attachment" class="attachment-image">
                                    <br><br>
                                    ${timestamp}
                                </div>`
                    } else {
                        return `<div class="chat-message">${msg.replace(/\n/g, '<br>')}</div>`
                    };
                })
                .join('');
        } else {
            chatHistory.innerHTML = 'Нет сообщений.';
        };
    } catch (error) {
        console.error(`Error in loadCustomerChatHistory: ${error}`);
        chatHistory.innerHTML = 'Произошла ошибка при загрузке сообщений.';
    };

    // Attach event listener for sending messages
    const sendButton = document.getElementById('send-button');
    sendButton.addEventListener('touchend', async (event) => {
        event.preventDefault();
        document.activeElement.blur();

        const messageTextArea = document.getElementById('message-input');
        const message = messageTextArea.value.trim();

        if (message) {
            // Send the message to the server to save and to route to Telegram
            const response = await fetch('/services/send-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    bid_id: performer.bidID,
                    customer_telegram_id: validatedTelegramID,
                    performer_telegram_id: performer.telegramID,
                    message,
                    sender_type: 'customer'
                })
            });

            // Send the message through the WebSocket to be displayed on the other side
            if (socket && socket.readyState === WebSocket.OPEN) {
                const messageData = {
                    recipient_telegram_id: performer.telegramID,
                    sender_name: name,
                    message,
                    attachment: null
                };

                socket.send(JSON.stringify(messageData));
            };

            if (response.ok) {
                const currentDate = new Date().toLocaleString();

                const chatHistory = document.getElementById('chat-history');
                chatHistory.innerHTML += `<div class="chat-message">
                                            Заказчик ${name}:
                                            <br><br>${message}
                                            <br><br>${currentDate}
                                          </div>`;

                messageTextArea.value = '';
                const display = document.getElementById('display');
                scrollToBottom(display);
            };
        };
    });

    const attachmentInput = document.getElementById('attachment-input');
    const attachmentButton = document.getElementById('attachment-button');
    attachmentButton.onclick = () => {
        attachmentInput.click();
    };

    attachmentInput.addEventListener('change', async () => {
        const file = attachmentInput.files[0];

        if (file) {
            const formData = new FormData();
            formData.append('attachment', file);
            formData.append('bid_id', performer.bidID);
            formData.append('customer_telegram_id', validatedTelegramID);
            formData.append('performer_telegram_id', performer.telegramID);
            formData.append('sender_type', 'customer');

            try {
                const response = await fetch('/services/send-message', {
                    method: 'POST',
                    body: formData
                });

                // Send the file through the WebSocket to be displayed on the other side
                const base64File = await fileToBase64(file);

                if (socket && socket.readyState === WebSocket.OPEN) {
                    const messageData = {
                        recipient_telegram_id: performer.telegramID,
                        sender_name: name,
                        message: '[File sent]',
                        attachment: base64File
                    };

                    socket.send(JSON.stringify(messageData));
                };

                if (response.ok) {
                    const currentDate = new Date().toLocaleString();
                    const chatHistory = document.getElementById('chat-history');

                    chatHistory.innerHTML += `<div class="chat-message">
                                                Заказчик ${name}:
                                                <br><br><img src="${URL.createObjectURL(file)}" alt="Attachment" class="attachment-image">
                                                <br><br>${currentDate}
                                              </div>`;

                    const display = document.getElementById('display');
                    scrollToBottom(display);
                };
            } catch (error) {
                console.error(`Error in sendAttachment: ${error}`);
                showModal('Произошла ошибка при отправке файла');
            };
        };
    });
};


async function showChangeProfileInfoForm() {
    const display = document.getElementById('display');
    if (!display) {
        console.error('Display element not found');
        return;
    } else {
        try {
            display.innerHTML = '';

            const response = await fetch('../templates/change_profile_info.html');

            if (!response.ok) {
                showModal('Произошла ошибка при загрузке формы профиля, попробейте перезайти в приложение');
                throw new Error('Failed to load change_profile_info.html');
            } else {
                const formHTML = await response.text();

                display.innerHTML = formHTML;
            };
        } catch (error) {
            console.error(`Error in showChangeProfileInfoForm: ${error}`);
        };
    };
};


async function handleProfileInfoFormSubmit(name, event, validatedTelegramID, registrationDate) {
    event.preventDefault();
    document.activeElement.blur();

    const rate = document.getElementById('rate-input');
    const experience = document.getElementById('experience-input');

    if (!rate.value || !experience.value) {
        showModal('Пожалуйста, заполните все поля.');
        return;
    } else {
        const data = {
            telegram_id: validatedTelegramID,
            rate: rate.value,
            experience: experience.value
        };

        try {
            const response = await fetch('/services/change-profile-info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                showModal('Произошла ошибка при изменении информации о профиле, попробуйте перезайти в приложение');
                throw new Error('Failed to change profile info');
            } else {
                const responseData = await response.json();
                if (responseData.success) {
                    const headerInfo = document.getElementById('header-user-info');
                    headerInfo.innerHTML = `Исполнитель ${name}.
                    Ставка ${rate.value} (₽/час),
                    ${experience.value} (лет опыта).
                    Зарегистрирован ${registrationDate}`;
                    rate.value = '';
                    experience.value = '';
                    showModal('Информация о профиле успешно изменена.');
                } else {
                    showModal('Произошла ошибка при изменении информации о профиле, попробуйте перезайти в приложение');
                };
            };
        } catch (error) {
            console.error(`Error in handleProfileInfoFormSubmit: ${error}`);
            showModal('Произошла ошибка при изменении информации о профиле.');
        };
    };
};
