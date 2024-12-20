import {
    fileToBase64,
    scrollToBottom,
    scrollInputsIntoView,
    initializeWebSocket,
    getQueryParameter,
    getUserData
} from "./modules/common_index.mjs";

import {
    fetchCouriers,
    fetchCustomers,
    showModal
} from "./modules/delivery_index.mjs";


window.onload = async function () {
    window.Telegram.WebApp.disableVerticalSwipes()

    const telegramID = getQueryParameter('telegram_id');
    if (telegramID) {
        try {
            const userData = await getUserData(telegramID);
            const validatedTelegramID = userData.userData.telegram_id;
            const role = userData.userData.delivery_role;
            const socket = initializeWebSocket(validatedTelegramID);

            if (role === 'customer') {
                setupCustomerInterface(validatedTelegramID, userData, socket);
            } else {
                setupCourierInterface(validatedTelegramID, userData, socket);
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
    const name = userData.userData.delivery_name;
    const registrationDate = userData.userData.delivery_registration_date;

    insertCustomerButtons(name, registrationDate);

    const createDeliveryButton = document.getElementById('create-delivery');
    createDeliveryButton.addEventListener('click', async function () {
        await showCreateDeliveryForm();

        // Attach submit form event listener
        const createDeliveryForm = document.getElementById('create-delivery-form');
        if (createDeliveryForm) {
            createDeliveryForm.addEventListener('submit', function (event) {
                handleDeliveryFormSubmit(event, validatedTelegramID, name);
            });
        };
    });

    const myDeliveriesButton = document.getElementById('my-deliveries');
    myDeliveriesButton.addEventListener('click', async function () {
        await showMyDeliveries(validatedTelegramID);
    });

    const lookChatsButton = document.getElementById('look-chats');
    lookChatsButton.addEventListener('click', async function () {
        const display = document.getElementById('display');
        display.classList.remove('view-mode');

        await showCustomerChats(validatedTelegramID, name, socket);
    });
};


function setupCourierInterface(validatedTelegramID, userData, socket) {
    const name = userData.userData.delivery_name;
    const dateOfBirth = userData.userData.date_of_birth;
    const hasCar = userData.userData.has_car;
    const carModel = userData.userData.car_model;
    const carWidth = userData.userData.car_width;
    const carLength = userData.userData.car_length;
    const carHeight = userData.userData.car_height;
    const registrationDate = userData.userData.delivery_registration_date;

    insertCourierButtons(
        name,
        dateOfBirth,
        hasCar,
        carModel,
        carWidth,
        carLength,
        carHeight, 
        registrationDate
    );

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

        await showCourierChats(validatedTelegramID, name, socket);
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

            const createDeliveryButton = document.createElement('button');
            createDeliveryButton.className = 'header-button';
            createDeliveryButton.id = 'create-delivery';
            createDeliveryButton.textContent = 'Опубликовать новый заказ 🏷️';

            const myDeliveriesButton = document.createElement('button');
            myDeliveriesButton.className = 'header-button';
            myDeliveriesButton.id = 'my-deliveries';
            myDeliveriesButton.textContent = 'Просмотреть мои заказы 📂';

            const lookChatsButton = document.createElement('button');
            lookChatsButton.className = 'header-button';
            lookChatsButton.id = 'look-chats';
            lookChatsButton.textContent = 'Переписки по активным заказам 📩';

            headerNav.appendChild(createDeliveryButton);
            headerNav.appendChild(myDeliveriesButton);
            headerNav.appendChild(lookChatsButton);
        } catch (error) {
            console.error(`Error in insertCustomerButtons: ${error}`);
        };
    };
};


function insertCourierButtons(
    name,
    dateOfBirth,
    hasCar,
    carModel,
    carWidth,
    carLength,
    carHeight,
    registrationDate
) {
    const headerNav = document.getElementById('header-nav');
    const headerInfo = document.getElementById('header-user-info');

    if (!headerNav || !headerInfo) {
        console.error('Header navigation element not found');
        return;
    } else {
        try {
            headerInfo.innerHTML = `Курьер ${name}. Дата рождения: ${dateOfBirth}.
            Есть автомобиль: ${hasCar ? 'да' : 'нет'} ${carModel}.
            Габариты автомобиля: ${carWidth}x${carLength}x${carHeight}.
            Зарегистрирован ${registrationDate}`;

            const searchBidsButton = document.createElement('button');
            searchBidsButton.className = 'header-button';
            searchBidsButton.id = 'search-bids';
            searchBidsButton.textContent = 'Искать заказы 🔎';

            const lookChatsButton = document.createElement('button');
            lookChatsButton.className = 'header-button';
            lookChatsButton.id = 'look-chats';
            lookChatsButton.textContent = 'Переписки по активным заказам 📨';

            headerNav.appendChild(searchBidsButton);
            headerNav.appendChild(lookChatsButton);
        } catch (error) {
            console.error(`Error in insertcourierButtons: ${error}`);
        };
    };
};


async function showCreateDeliveryForm() {
    const display = document.getElementById('display');
    if (!display) {
        console.error('Display element not found');
        return;
    } else {
        try {
            display.innerHTML = '';

            const response = await fetch('../templates/create_delivery_form.html');

            if (!response.ok) {
                display.textContent = 'Произошла ошибка при загрузке формы создания заказа, попробуйте перезайти в приложение';
                console.error('Failed to load create_delivery_form.html');
            } else {
                const formHTML = await response.text();

                display.innerHTML = formHTML;

                scrollInputsIntoView();
            };
        } catch (error) {
            console.error(`Error in showCreateDeliveryForm: ${error}`);
        };
    };
};


function handleDeliveryFormSubmit(event, validatedTelegramID, name) {
    event.preventDefault();

    const description = document.getElementById('description-textarea');
    const deliverFrom = document.getElementById('deliver-from');
    const deliverTo = document.getElementById('deliver-to');
    const carNecessary = document.querySelector('input[name="car-necessary"]:checked');

    // Check if the fields are valid
    if (!description.value || !deliverFrom.value || !deliverTo.value || !carNecessary) {
        showModal('Пожалуйста, заполните всю форму.');
        return;
    } else {
        const data = {
            customer_telegram_id: validatedTelegramID,
            customer_name: name,
            city: city.value,
            description: description.value,
            deliver_from: deliverFrom.value,
            deliver_to: deliverTo.value,
            car_necessary: carNecessary.value
        };

        fetch('/delivery/post-delivery', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(data => {
                showModal(data.message)
            })
            .catch((error) => {
                console.error('Error:', error);
                showModal('Произошла ошибка при создании заказа. Попробуйте позже.');
            });
    };
};


async function showMyDeliveries(validatedTelegramID) {
    const display = document.getElementById('display');
    if (!display) {
        console.error('Display element not found');
        return;
    } else {
        try {
            display.innerHTML = '';

            const response = await fetch('/delivery/my-deliveries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ customer_telegram_id: validatedTelegramID })  // Send the Telegram ID as JSON
            });

            if (!response.ok) {
                showModal('Произошла ошибка при загрузке списка заказов, попробуйте перезайти в приложение');
                throw new Error('Failed to load my-bids');
            };

            const { success, deliveries } = await response.json();

            if (success && deliveries.length > 0) {
                const deliveriesContainer = document.createElement('div');
                deliveriesContainer.classList.add('deliveries-container');

                deliveries.forEach((delivery) => {
                    const deliveryCard = document.createElement('div');
                    deliveryCard.classList.add('delivery-card');

                    deliveryCard.innerHTML = `
                        <h3>Заказ #${delivery.id}</h3>
                        <br>
                        <p>Город: ${delivery.city}</p>
                        <br>
                        <p>Что нужно доставить, описание: ${delivery.description}</p>
                        <br>
                        <p>Откуда: ${delivery.deliver_from}</p>
                        <p>Куда: ${delivery.deliver_to}</p>
                        <br>
                        <p>Нужна машина: ${(delivery.car_necessary === 1) ? 'Да' : 'Нет'}</p>
                        <button class="delivery-card-button" data-delivery-id="${delivery.id}">Закрыть заказ 🔐</button>
                    `;

                    const closeDeliveryButton = deliveryCard.querySelector('.delivery-card-button');
                    closeDeliveryButton.addEventListener('click', async (event) => {
                        const deliveryID = event.target.getAttribute('data-delivery-id');

                        if (deliveryID) {
                            const confirmation = confirm('Вы уверены, что хотите закрыть заказ?');
                            if (confirmation) {
                                try {
                                    const response = await fetch('/delivery/close-delivery', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({ delivery_id: deliveryID })
                                    });

                                    if (!response.ok) {
                                        showModal('Произошла ошибка при закрытии заказа, попробуйте перезайти в приложение');
                                        console.error('Failed to close delivery');
                                    } else {
                                        const { success, message } = await response.json();
                                        if (success) {
                                            showModal(message);
                                            showMyDeliveries(validatedTelegramID);
                                        };
                                    };
                                } catch (error) {
                                    console.error(`Error in showMyDeliveries: ${error}`);
                                };
                            };
                        };
                    });
                    deliveriesContainer.appendChild(deliveryCard);
                });
                display.appendChild(deliveriesContainer);
            } else {
                display.innerHTML = `<p>У вас нет активных заказов</p>`;
            };
        } catch (error) {
            console.error(`Error in showMyDeliveries: ${error}`);
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
        await showDeliveries(city, validatedTelegramID);
    };
};


async function showDeliveries(city, validatedTelegramID) {
    const display = document.getElementById('display');
    if (!display) {
        console.error('Display element not found');
        return;
    } else {
        try {
            display.innerHTML = '';

            const response = await fetch('/delivery/get-deliveries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ city: city })  // Send the city as JSON
            });

            if (!response.ok) {
                showModal('Произошла ошибка при загрузке списка заказов, попробуйте перезайти в приложение');
                console.error('Failed to load deliveries');
            };

            const deliveriesResponse = await response.json();

            if (deliveriesResponse && deliveriesResponse.deliveries.length > 0) {
                const deliveriesContainer = document.createElement('div');
                deliveriesContainer.classList.add('deliveries-container');

                deliveriesResponse.deliveries.forEach(delivery => {
                    const deliveryCard = document.createElement('div');
                    deliveryCard.classList.add('delivery-card');

                    deliveryCard.innerHTML = `
                        <p>Заказчик: ${delivery.customer_name}</p>
                        <br>
                        <p>Что нужно доставить, описание: ${delivery.description}</p>
                        <br>
                        <p>Откуда: ${delivery.deliver_from}</p>
                        <p>Куда: ${delivery.deliver_to}</p>
                        <br>
                        <p>Нужна машина: ${(delivery.car_necessary === 1) ? 'Да' : 'Нет'}</p>
                        <button id="respond-to-delivery" class="delivery-card-button" data-delivery-id="${delivery.id}">Откликнуться ☑️</button>
                        <button id="look-chats" class="delivery-card-button">Посмотреть переписки заказчика 📤</button>
                    `;

                    deliveryCard.querySelector('#respond-to-delivery').addEventListener('click', async (event) => {
                        const deliveryID = event.target.getAttribute('data-delivery-id');

                        if (deliveryID) {
                            try {
                                fetch('/delivery/respond-to-delivery', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({ delivery_id: deliveryID, courier_telegram_id: validatedTelegramID })
                                })
                                    .then(response => response.json())
                                    .then(data => {
                                        if (data.success) {
                                            showModal(data.message);
                                            showDeliveries(city, validatedTelegramID);
                                        };
                                    })
                                    .catch(error => {
                                        console.error(`Error in showDeliveries: ${error}`);
                                        showModal('Произошла ошибка при отклике на заказ, попробуйте перезайти в приложение');
                                    });
                            } catch (error) {
                                console.error(`Error in showDeliveries: ${error}`);
                                showModal('Произошла ошибка при отклике на заказ, попробуйте перезайти в приложение');
                            };
                        };
                    });

                    deliveryCard.querySelector('#look-chats').addEventListener('click', async (event) => {
                        const customerTelegramID = delivery.customer_telegram_id

                        if (customerTelegramID) {
                            await showCustomerChatsWithCouriers(customerTelegramID);
                        } else {
                            showModal('Произошла ошибка при загрузке переписки, попробуйте перезайти в приложение');
                            console.error('Customer Telegram ID not found');
                        };
                    });

                    deliveriesContainer.appendChild(deliveryCard);
                });
                display.appendChild(deliveriesContainer);
            } else {
                display.innerHTML = `<p>В данном городе нет активных заказов</p>`;
            };
        } catch (error) {
            console.error(`Error in showDeliveries: ${error}`);
        };
    };
};


function showCustomerChatsWithCouriers(customerTelegramID) {
    const display = document.getElementById('display');
    if (!display) {
        console.error('Display element not found');
        return;
    } else {
        try {
            display.innerHTML = '';
            display.innerHTML = 'Загрузка...';
            fetch('/delivery/show-customer-chats-list', {
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
                            <p>Что нужно доставить, описание: ${bid.description}</p>
                            <p>Откуда: ${bid.deliver_from}</p>
                            <p>Куда: ${bid.deliver_to}</p>
                            <p>Нужна машина: ${(bid.car_necessary === 1) ? 'Да' : 'Нет'}</p>
                            <br><br>
                        `;

                            bid.responses.forEach((response) => {
                                const responseDetails = `
                                <div class="response-container">
                                    <p>Откликнулся: ${response.courier_name}</p>
                                    <p>Дата рождения: ${response.courier_date_of_birth}</p>
                                    <p>Есть ли машина: ${response.courier_has_car}</p>
                                    <p>Габариты машины: ${response.courier_car_}</p>
                                </div>
                            `;

                                const lookChatButton = document.createElement('button');
                                lookChatButton.classList.add('bid-card-button');
                                lookChatButton.innerHTML = 'Посмотреть переписку 👀';
                                lookChatButton.setAttribute('data-bid-id', bid.id);
                                lookChatButton.setAttribute('data-customer-telegram-id', customerTelegramID);
                                lookChatButton.setAttribute('data-courier-telegram-id', response.courier_telegram_id);

                                lookChatButton.addEventListener('click', async (event) => {
                                    const bidID = event.target.getAttribute('data-bid-id');
                                    const customerTelegramID = event.target.getAttribute('data-customer-telegram-id');
                                    const courierTelegramID = event.target.getAttribute('data-courier-telegram-id');
                                    if (bidID && customerTelegramID && courierTelegramID) {
                                        await showSelectedCustomerChat(bidID, customerTelegramID, courierTelegramID);
                                    } else {
                                        showModal('Произошла ошибка при загрузке переписки, попробуйте перезайти в приложение.');
                                        console.error('Bid ID, Customer Telegram ID, or Courier Telegram ID not found');
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
                    console.error(`Error in showCustomerChatsWithCouriers: ${error}`);
                });
        } catch (error) {
            console.error(`Error in showCustomerChatsWithCouriers: ${error}`);
        };
    };
};


async function showSelectedCustomerChat(bidID, customerTelegramID, courierTelegramID) {
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
                `/delivery/get-chats?bid_id=${bidID}&customer_telegram_id=${customerTelegramID}&courier_telegram_id=${courierTelegramID}`
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
                            if (msg.includes('app/chats/delivery/attachments/')) {
                                // Extract sender, attachment path, and timestamp
                                const [senderLine, attachmentString, timestamp] = msg.split('\n').filter(line => line.trim() !== '');
                                const attachmentUrl = attachmentString.replace('app/chats/delivery/attachments/', '/delivery/attachments/');

                                const customerName = await fetch('/common/get-user-data', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({ telegram_id: customerTelegramID })
                                })
                                    .then(response => response.json())
                                    .then(data => data.userData.name);
                                const courierName = await fetch('/common/get-user-data', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({ telegram_id: courierTelegramID })
                                })
                                    .then(response => response.json())
                                    .then(data => data.userData.delivery_name);

                                const senderName = senderLine.includes('Заказчик')
                                    ? `Заказчик ${customerName}:`
                                    : `Курьер ${courierName}:`;

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


async function showCourierChats(validatedTelegramID, name, socket) {
    // Fetch the list of customers who wrote to the courier
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
                    loadCourierChatHistory(validatedTelegramID, name, customer, socket)
                    chatInput.classList.remove('hidden');
                });
                customerList.appendChild(button);
            });

            scrollInputsIntoView();
        };
    } catch (error) {
        console.error(`Error in showCourierChats: ${error}`);
    };
};


async function loadCourierChatHistory(validatedTelegramID, name, customer, socket) {
    const chatHistory = document.getElementById('chat-history');

    // Clear the chat history
    chatHistory.innerHTML = '';
    chatHistory.innerHTML = 'Загрузка...';

    try {
        // Fetch the chat history
        const response = await fetch(
            `/delivery/get-chats?delivery_id=${customer.delivery_id}&customer_telegram_id=${customer.telegram_id}&courier_telegram_id=${validatedTelegramID}`
        );
        const data = await response.json();
        
        if (data.success && Array.isArray(data.chatMessages) && data.chatMessages.length > 0) {
            chatHistory.innerHTML = data.chatMessages
                // Filter out empty messages
                .filter((msg) => msg.trim() !== '')
                // Replace '\n' with <br>
                .map((msg) => {
                    if (msg.includes('app/chats/delivery/attachments/')) {
                        // Extract sender and timestamp
                        const [senderLine, attachmentString, timestamp] = msg.split('\n').filter(line => line.trim() !== '');
                        const attachmentUrl = attachmentString.replace('app/chats/delivery/attachments/', '/delivery/attachments/');
                        const senderName = senderLine.includes('Заказчик')
                            ? `Заказчик ${customer.name}:`
                            : `Курьер ${name}:`;

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
        console.error(`Error in loadCourierChatHistory: ${error}`);
        chatHistory.innerHTML = 'Произошла ошибка при загрузке сообщений.';
    };

    // Attach event listener for sending messages
    const sendButton = document.getElementById('send-button');
    sendButton.onclick = async () => {
        const messageTextArea = document.getElementById('message-input');
        const message = messageTextArea.value.trim();

        if (message) {
            // Send the message to the server to save and to route to Telegram
            const response = await fetch('/delivery/send-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    delivery_id: customer.delivery_id,
                    customer_telegram_id: customer.telegram_id,
                    courier_telegram_id: validatedTelegramID,
                    message,
                    sender_type: 'courier'
                })
            });
            // Send the message through the WebSocket to be displayed on the other side
            if (socket && socket.readyState === WebSocket.OPEN) {
                const messageData = {
                    recipient_telegram_id: customer.telegram_id,
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
                                            Курьер ${name}:
                                            <br><br>${message}
                                            <br><br>${currentDate}
                                            </div>`;

                messageTextArea.value = '';
                const display = document.getElementById('display');
                scrollToBottom(display);
            };
        };
    };

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
            formData.append('delivery_id', customer.delivery_id);
            formData.append('customer_telegram_id', customer.telegram_id);
            formData.append('courier_telegram_id', validatedTelegramID);
            formData.append('sender_type', 'courier');

            try {
                const response = await fetch('/delivery/send-message', {
                    method: 'POST',
                    body: formData
                });

                // Send the file through the WebSocket to be displayed on the other side
                const base64File = await fileToBase64(file);

                if (socket && socket.readyState === WebSocket.OPEN) {
                    const messageData = {
                        recipient_telegram_id: customer.telegram_id,
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
                                                Курьер ${name}:
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
    // Fetch the list of couriers who responded to the customer's bids
    try {
        const couriers = await fetchCouriers(validatedTelegramID);

        if (couriers.length === 0) {
            showModal('На Ваши заявки ещё никто не откликался.');
            return;
        } else {
            // Create the chat interface
            const response = await fetch('../templates/chat_window.html');
            display.innerHTML = await response.text(); // Properly inject the fetched HTML content

            // Populate the courier buttons
            const courierList = document.getElementById('user-list');
            const chatInput = document.getElementById('chat-input');

            couriers.forEach((courier) => {
                const courierParagraph = document.createElement('p');

                courierParagraph.innerHTML =
                    `${courier.name}. Зарегистрирован ${courier.registration_date}. 
                    Дата рождения: ${courier.date_of_birth}. Есть машина: ${courier.has_car ? 'да' : 'нет'}.` +
                    (courier.has_car ? 
                        ` Модель: ${courier.car_model}. Габариты машины: ${courier.car_width}x${courier.car_length}x${courier.car_height}.`
                        : '');

                const chatButton = document.createElement('button');
                chatButton.innerHTML = 'Написать курьеру 📩';
                chatButton.addEventListener('click', () => {
                    loadCustomerChatHistory(validatedTelegramID, name, courier, socket)
                    chatInput.classList.remove('hidden');
                });

                const lookCourierChatsButton = document.createElement('button');
                lookCourierChatsButton.innerHTML = 'Посмотреть переписки курьера 📤';
                lookCourierChatsButton.addEventListener('click', () => showCourierChatsWithCustomers(courier.telegramID));

                courierList.appendChild(courierParagraph);
                courierList.appendChild(chatButton);
                courierList.appendChild(lookCourierChatsButton);
            });

            scrollInputsIntoView();
        };
    } catch (error) {
        console.error(`Error in showCustomerChats: ${error}`);
    };
};


function showCourierChatsWithCustomers(courierTelegramID) {
    const display = document.getElementById('display');
    display.innerHTML = '';
    if (!display) {
        console.error('Display element not found');
        return;
    } else {
        try {
            display.innerHTML = '';
            display.innerHTML = 'Загрузка...';
            fetch('/delivery/show-courier-chats-list', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ courier_telegram_id: courierTelegramID })
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
                        <p>Что нужно доставить, описание: ${bid.description}</p>
                        <p>Откуда: ${bid.deliver_from}</p>
                        <p>Куда: ${bid.deliver_to}</p>
                        <p>Нужна машина: ${(bid.car_necessary === 1) ? 'Да' : 'Нет'}</p>
                        `;

                            const responseButton = document.createElement('button');
                            responseButton.classList.add('bid-card-button');
                            responseButton.innerHTML = 'Посмотреть переписку 👀';
                            responseButton.setAttribute('data-bid-id', bid.id);
                            responseButton.setAttribute('data-customer-telegram-id', bid.customer_telegram_id);
                            responseButton.setAttribute('data-courier-telegram-id', courierTelegramID);

                            responseButton.addEventListener('click', async (event) => {
                                const bidID = event.target.getAttribute('data-bid-id');
                                const customerTelegramID = event.target.getAttribute('data-customer-telegram-id');
                                const courierTelegramID = event.target.getAttribute('data-courier-telegram-id');

                                if (bidID && customerTelegramID && courierTelegramID) {
                                    await showSelectedCourierChat(bidID, customerTelegramID, courierTelegramID);
                                } else {
                                    showModal('Произошла ошибка при загрузке переписки, попробойте перезайти в приложение.');
                                    console.error('Invalid bid ID, customer Telegram ID, or courier Telegram ID');
                                }
                            });

                            responseCard.appendChild(responseButton);
                            responsesContainer.appendChild(responseCard);
                        });

                        display.appendChild(responsesContainer);
                    } else {
                        showModal('У данного курьера ещё нет переписок');
                    };
                })
                .catch(error => {
                    console.error(`Error in showCourierChatsWithCustomers: ${error}`);
                    showModal('Произошла ошибка при загрузке списка заказов, попробуйте перезайти в приложение');
                });
        } catch (error) {
            showModal('Произошла ошибка при загрузке списка заказов, попробуйте перезайти в приложение');
            console.error(`Error in showCourierChatsWithCustomers: ${error}`);
        };
    };
};


async function showSelectedCourierChat(bidID, customerTelegramID, courierTelegramID) {
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
                `/delivery/get-chats?bid_id=${bidID}&customer_telegram_id=${customerTelegramID}&courier_telegram_id=${courierTelegramID}`
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
                            if (msg.includes('app/chats/delivery/attachments/')) {
                                // Extract sender, attachment path, and timestamp
                                const [senderLine, attachmentString, timestamp] = msg.split('\n').filter(line => line.trim() !== '');
                                const attachmentUrl = attachmentString.replace('app/chats/delivery/attachments/', '/delvery/attachments/');
                                console.log(attachmentUrl);

                                const customerName = await fetch('/common/get-user-data', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({ telegram_id: customerTelegramID })
                                })
                                    .then(response => response.json())
                                    .then(data => data.userData.delivery_name);
                                const courierName = await fetch('/common/get-user-data', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({ telegram_id: courierTelegramID })
                                })
                                    .then(response => response.json())
                                    .then(data => data.userData.delivery_name);

                                const senderName = senderLine.includes('Заказчик')
                                    ? `Заказчик ${customerName}:`
                                    : `Курьер ${courierName}:`;

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
            console.error(`Error in showSelectedCourierChat: ${error}`);
        };
    };
};


async function loadCustomerChatHistory(validatedTelegramID, name, courier, socket) {
    const chatHistory = document.getElementById('chat-history');
    
    // Clear the chat history
    chatHistory.innerHTML = '';
    chatHistory.innerHTML = 'Загрузка...';

    try {
        // Fetch the chat history
        const response = await fetch(
            `/delivery/get-chats?delivery_id=${courier.delivery_id}&customer_telegram_id=${validatedTelegramID}&courier_telegram_id=${courier.telegram_id}`
        );
        const data = await response.json();
        
        if (data.success && Array.isArray(data.chatMessages) && data.chatMessages.length > 0) {
            chatHistory.innerHTML = data.chatMessages
                // Filter out empty messages
                .filter((msg) => msg.trim() !== '')
                // Replace '\n' with <br>
                .map((msg) => {
                    if (msg.includes('app/chats/delivery/attachments/')) {
                        // Extract sender, attachment path, and timestamp
                        const [senderLine, attachmentString, timestamp] = msg.split('\n').filter(line => line.trim() !== '');
                        const attachmentUrl = attachmentString.replace('app/chats/delivery/attachments/', '/delivery/attachments/');
                        const senderName = senderLine.includes('Заказчик')
                            ? `Заказчик ${name}:`
                            : `Курьер ${courier.name}:`;

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
    sendButton.onclick = async () => {
        const messageTextArea = document.getElementById('message-input');
        const message = messageTextArea.value.trim();

        if (message) {
            // Send the message to the server to save and to route to Telegram
            const response = await fetch('/delivery/send-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    delivery_id: courier.delivery_id,
                    customer_telegram_id: validatedTelegramID,
                    courier_telegram_id: courier.telegram_id,
                    message,
                    sender_type: 'customer'
                })
            });

            // Send the message through the WebSocket to be displayed on the other side
            if (socket && socket.readyState === WebSocket.OPEN) {
                const messageData = {
                    recipient_telegram_id: courier.telegram_id,
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
    };

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
            formData.append('delivery_id', courier.delivery_id);
            formData.append('customer_telegram_id', validatedTelegramID);
            formData.append('courier_telegram_id', courier.telegram_id);
            formData.append('sender_type', 'customer');

            try {
                const response = await fetch('/delivery/send-message', {
                    method: 'POST',
                    body: formData
                });

                // Send the file through the WebSocket to be displayed on the other side
                const base64File = await fileToBase64(file);

                if (socket && socket.readyState === WebSocket.OPEN) {
                    const messageData = {
                        recipient_telegram_id: courier.telegram_id,
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