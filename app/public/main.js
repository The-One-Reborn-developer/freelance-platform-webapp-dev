window.onload = async function () {
    window.Telegram.WebApp.disableVerticalSwipes()
    
    const telegramID = getQueryParameter('telegram_id');
    if (telegramID) {
        try {
            const userData = await getUserData(telegramID);
            const validatedTelegramID = userData.userData.telegram_id;
            const role = userData.userData.role;
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
            lookChatsButton.textContent = 'Переписки по активным заказам 📩';

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
            headerInfo.innerHTML = `Мастер ${name}. Ставка ${rate} (₽/час), ${experience} (лет опыта)`;

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

            const response = await fetch('create_bid_form.html');

            if (!response.ok) {
                display.textContent = 'Произошла ошибка при загрузке формы создания заказа, попробуйте перезайти в приложение';
                throw new Error('Failed to load create_bid_form.html');                
            } else {
                const formHTML = await response.text();

                display.innerHTML = formHTML;
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

        fetch('/post-bid', {
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


function showModal(message) {
    const modal = document.getElementById('create-bid-form-modal');
    const modalOkButton = document.getElementById('modal-button');
    const modalMessage = document.getElementById('modal-message')

    modal.style.visibility = 'visible';
    modalMessage.innerHTML = message;

    modalOkButton.onclick = () => {
        modal.style.visibility = 'hidden';
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

            const response = await fetch('/my-bids', {
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
                        <p>Предоставляется инструмент: ${(bid.instrument_provided === true || bid.instrument_provided === 1) ? 'Да' : 'Нет'}</p>
                        <button class="bid-card-button" data-bid-id="${bid.id}">Закрыть заказ 🔐</button>
                    `;

                    const closeBidButton = bidCard.querySelector('.bid-card-button');
                    closeBidButton.addEventListener('click', async (event) => {
                        const bidID = event.target.getAttribute('data-bid-id');
                        
                        if (bidID) {
                            const confirmation = confirm('Вы уверены, что хотите закрыть заказ?');
                            if (confirmation) {
                                try {
                                    const response = await fetch('/close-bid', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({ bid_id: bidID })  // Send the Telegram ID as JSON
                                    });

                                    if (!response.ok) {
                                        showModal('Произошла ошибка при закрытии заказа, попробуйте перезайти в приложение');
                                        throw new Error('Failed to close bid');
                                    } else {
                                        const { success, message } = await response.json();
                                        if (success) {
                                            showModal(message);
                                            showMyBids(validatedTelegramID);
                                        };
                                    };
                                } catch (error) {
                                    console.error(`Error in close-bid: ${error}`);
                                };
                            };
                        };
                    });
                    bidsContainer.appendChild(bidCard);
                });
                display.appendChild(bidsContainer);
            } else {
                display.innerHTML = `<p>У вас нет активных заказов</p>`;
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
            
            const response = await fetch('select_city.html');

            if (!response.ok) {
                showModal('Произошла ошибка при загрузке списка заказов, попробуйте перезайти в приложение');
                throw new Error('Failed to load select_city.html');
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
            
            const response = await fetch('/get-bids', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ city: city })  // Send the city as JSON
            });

            if (!response.ok) {
                showModal('Произошла ошибка при загрузке списка заказов, попробуйте перезайти в приложение');
                throw new Error('Failed to load bids');
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
                        <p>Предоставляется инструмент: ${(bid.instrument_provided === 1 || bid.instrument_provided === true) ? 'Да' : 'Нет'}</p>
                        <button id="respond-to-bid" class="bid-card-button" data-bid-id="${bid.id}">Откликнуться ☑️</button>
                        <button id="look-chats" class="bid-card-button">Посмотреть переписки заказчика 📤</button>
                    `;

                    bidCard.querySelector('#respond-to-bid').addEventListener('click', async (event) => {
                        const bidID = event.target.getAttribute('data-bid-id');
                        
                        if (bidID) {
                            try {
                                fetch ('/respond-to-bid', {
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
                                    console.error(`Error in respond-to-bid: ${error}`);
                                    showModal('Произошла ошибка при отклике на заказ, попробуйте перезайти в приложение');
                                });
                            } catch (error) {
                                console.error(`Error in respond-to-bid: ${error}`);
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
            fetch ('/show-chats-list', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ customer_telegram_id: customerTelegramID })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log(data)
                } else {
                    showModal('Произошла ошибка при загрузке переписки, попробуйте перезайти в приложение');
                };
            })
            .catch(error => {
                console.error(`Error in show-chats: ${error}`);
            });
        } catch (error) {
            console.error(`Error in show-chats: ${error}`);
        };
    };
};


function setupPerformerInterface (validatedTelegramID, userData, socket) {
    const name = userData.userData.name;
    const rate = userData.userData.rate;
    const experience = userData.userData.experience;

    insertPerformerButtons(name, rate, experience);

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
        await showPerformerChats(validatedTelegramID, name, socket);
    });

    const changeProfileInfoButton = document.getElementById('change-profile-info');
    changeProfileInfoButton.addEventListener('click', async function () {
        await showChangeProfileInfoForm();

        // Attach submit form event listener
        const changeProfileInfoForm = document.getElementById('change-profile-info-form');
        if (changeProfileInfoForm) {
            changeProfileInfoForm.addEventListener('submit', async function (event) {
                await handleProfileInfoFormSubmit(event, validatedTelegramID);
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
            const response = await fetch('chat_window.html');
            display.innerHTML = await response.text(); // Properly inject the fetched HTML content

            // Populate the customer buttons
            const customerList = document.getElementById('user-list');
            customers.forEach((customer) => {
                const button = document.createElement('button');
                button.innerHTML = `${customer.name}`;
                button.addEventListener('click', () => loadPerformerChatHistory(validatedTelegramID, name, customer, socket));
                customerList.appendChild(button);
            });
        };
    } catch (error) {
        console.error(`Error in showPerformerChats: ${error}`);
    };
};


async function fetchCustomers(validatedTelegramID) {
    try {
        const response = await fetch(`/responded-customers?performer_telegram_id=${validatedTelegramID}`);
        const data = await response.json();

        if (data.success && Array.isArray(data.bidsInfo)) {
            return data.bidsInfo.map((res) => ({
                name: res.customer_name,
                bidID: res.id,
                telegramID: res.customer_telegram_id
            }));
        } else {
            return [];
        };
    } catch (error) {
        console.error(`Error in fetchCustomers: ${error}`);
        return [];
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
            `/get-chats?bid_id=${customer.bidID}&customer_telegram_id=${customer.telegramID}&performer_telegram_id=${validatedTelegramID}`
        );
        const data = await response.json();

        if (data.success && Array.isArray(data.chatMessages) && data.chatMessages.length > 0) {
            chatHistory.innerHTML = data.chatMessages
                // Filter out empty messages
                .filter((msg) => msg.trim() !== '')
                // Replace '\n' with <br>
                .map((msg) => `<div class="chat-message">${msg.replace(/\n/g, '<br>')}</div>`)
                .join('');
        } else {
            chatHistory.innerHTML = 'Нет сообщений.';
        };
    } catch (error) {
        console.error(`Error in loadChatHistory: ${error}`);
        chatHistory.innerHTML = 'Произошла ошибка при загрузке сообщений.';
    };

    // Attach event listener for sending messages
    const sendButton = document.getElementById('send-button');
    sendButton.onclick = async () => {
        const messageInput = document.getElementById('message-input');
        const message = messageInput.value.trim();

        if (message) {
            // Send the message to the server to save and to route to Telegram
            const response = await fetch('/send-message', {
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
                    message
                };
                console.log(`Message data: ${JSON.stringify(messageData)}`);

                socket.send(JSON.stringify(messageData));
            };

            if (response.ok) {
                const currentDate = new Date().toLocaleString();

                const chatHistory = document.getElementById('chat-history');

                chatHistory.innerHTML += `<div class="chat-message">
                                            Мастер ${name}:
                                            <br><br>${message}
                                            <br><br>${currentDate}
                                            </div>`;

                messageInput.value = '';
                const display = document.getElementById('display');
                scrollToBottom(display);
            };
        };            
    };
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
            const response = await fetch('chat_window.html');
            display.innerHTML = await response.text(); // Properly inject the fetched HTML content

            // Populate the performer buttons
            const performerList = document.getElementById('user-list');
            performers.forEach((performer) => {
                const button = document.createElement('button');
                button.innerHTML = `${performer.name}, ставка: ${performer.rate}/час, опыт: ${performer.experience} (в годах)`;
                button.addEventListener('click', () => loadCustomerChatHistory(validatedTelegramID, name, performer, socket));
                performerList.appendChild(button);
            });
        };
    } catch (error) {
        console.error(`Error in showCustomerChats: ${error}`);
    };
};


async function fetchPerformers(validatedTelegramID) {
    try {
        const response = await fetch(`/responded-performers?customer_telegram_id=${validatedTelegramID}`);
        const data = await response.json();

        if (data.success) {
            return data.responses.map((res) => ({
                name: res.performerName,
                rate: res.performerRate,
                experience: res.performerExperience,
                bidID: res.bidID,
                telegramID: res.performerTelegramID
            }));
        } else {
            return [];
        };
    } catch (error) {
        console.error(`Error in fetchPerformers: ${error}`);
        return [];
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
            `/get-chats?bid_id=${performer.bidID}&customer_telegram_id=${validatedTelegramID}&performer_telegram_id=${performer.telegramID}`
        );
        const data = await response.json();

        if (data.success && Array.isArray(data.chatMessages) && data.chatMessages.length > 0) {
            chatHistory.innerHTML = data.chatMessages
                // Filter out empty messages
                .filter((msg) => msg.trim() !== '')
                // Replace '\n' with <br>
                .map((msg) => `<div class="chat-message">${msg.replace(/\n/g, '<br>')}</div>`)
                .join('');
        } else {
            chatHistory.innerHTML = 'Нет сообщений.';
        };
    } catch (error) {
        console.error(`Error in loadChatHistory: ${error}`);
        chatHistory.innerHTML = 'Произошла ошибка при загрузке сообщений.';
    };

    // Attach event listener for sending messages
    const sendButton = document.getElementById('send-button');
    sendButton.onclick = async () => {
        const messageInput = document.getElementById('message-input');
        const message = messageInput.value.trim();

        if (message) {
            // Send the message to the server to save and to route to Telegram
            const response = await fetch('/send-message', {
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
                    message
                };
                console.log(`Message data: ${JSON.stringify(messageData)}`);

                socket.send(JSON.stringify(messageData));
            };

            if (response.ok) {
                const currentDate = new Date().toLocaleString();

                const chatHistory = document.getElementById('chat-history');

                chatHistory.innerHTML += `<div class="chat-message">
                                            Заказчик ${name}
                                            <br><br>${message}
                                            <br><br>${currentDate}
                                        </div>`;

                messageInput.value = '';
                const display = document.getElementById('display');
                scrollToBottom(display);
            };
        };            
    };
};


async function showChangeProfileInfoForm() {
    display = document.getElementById('display');
    if (!display) {
        console.error('Display element not found');
        return;
    } else {
        try {
            display.innerHTML = '';
            
            const response = await fetch('change_profile_info.html');
            
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


async function handleProfileInfoFormSubmit(event, validatedTelegramID) {
    event.preventDefault();

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
            const response = await fetch('/change-profile-info', {
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


function setupCustomerInterface (validatedTelegramID, userData, socket) {
    const name = userData.userData.name;
    console.log(`Customer name: ${name}`);

    insertCustomerButtons(name);

    const createBidButton = document.getElementById('create-bid');
    createBidButton.addEventListener('click', async function () {
        await showCreateBidForm();

        // Attach submit form event listener
        const createBidForm = document.getElementById('create-bid-form');
        if (createBidForm) {
            createBidForm.addEventListener('submit', function (event) {
                handleBidFormSubmit(event, validatedTelegramID, name);
            });
        };
    });

    const myBidsButton = document.getElementById('my-bids');
    myBidsButton.addEventListener('click', async function () {
        await showMyBids(validatedTelegramID);
    });
    
    const lookChatsButton = document.getElementById('look-chats');
    lookChatsButton.addEventListener('click', async function () {
        await showCustomerChats(validatedTelegramID, socket);
    });
};


function initializeWebSocket(validatedTelegramID) {
    if (!validatedTelegramID) {
        console.error('Telegram ID not found, unable to initialize WebSocket');
        return;
    } else {
        const socket = new WebSocket(`wss://${window.location.host}?telegramID=${validatedTelegramID}`);

        socket.addEventListener('open', () => {
            console.log(`WebSocket connection established for Telegram ID: ${validatedTelegramID}`);
        });

        socket.addEventListener('close', () => {
            console.log(`WebSocket connection closed for Telegram ID: ${validatedTelegramID}. Reconnecting...`);
            setTimeout(connect, 5000); // Reconnect after 5 seconds
        });

        socket.addEventListener('error', (error) => {
            console.error(`WebSocket error for Telegram ID ${validatedTelegramID}: ${error}`);
        });

        socket.addEventListener('message', (event) => {
            console.log(`Received message from Telegram ID ${validatedTelegramID}: ${event.data}`);

            try {
                const messageData = JSON.parse(event.data);

                const normalizedData = {
                    senderTelegramID: messageData.sender_telegram_id,
                    senderName: messageData.sender_name,
                    message: messageData.message
                }

                if (!normalizedData.senderName || !normalizedData.message) {
                    console.error('Invalid message data received');
                    return;
                } else if (
                    !messageData ||
                    typeof messageData.sender_name !== 'string' ||
                    typeof messageData.message !== 'string' ||
                    messageData.sender_name.trim() === '' ||
                    messageData.message.trim() === ''
                ) {
                    console.error('Invalid message data received');
                    return;
                };

                console.log(`Valid message received from ${messageData.sender_name.trim()}: ${messageData.message.trim()}`);

                const chatHistory = document.getElementById('chat-history');
                chatHistory.innerHTML += `<div class="chat-message">
                                            ${normalizedData.senderName}
                                            <br><br>${normalizedData.message}
                                            <br><br>${new Date().toLocaleString('ru-RU', { timezone: 'Europe/Moscow' })}
                                          </div>`;

                const display = document.getElementById('display');
                scrollToBottom(display);
            } catch (error) {
                console.error(`Error parsing message data: ${error}`);
            };
        });

        return socket
    };
};


function scrollToBottom(element) {
    element.scrollTop = element.scrollHeight;
};