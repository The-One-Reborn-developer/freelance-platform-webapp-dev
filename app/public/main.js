window.onload = async function () {
    window.Telegram.WebApp.disableVerticalSwipes()
    
    const telegramID = getQueryParameter('telegram_id');
    if (telegramID) {
        try {
            const userData = await getUserData(telegramID);
            if (userData.userData.role === 'customer') {
                const name = userData.userData.name;

                insertCustomerButtons(name);

                const createBidButton = document.getElementById('create-bid');
                createBidButton.addEventListener('click', async function () {
                    await showCreateBidForm();

                    // Attach submit form event listener
                    const createBidForm = document.getElementById('create-bid-form');
                    if (createBidForm) {
                        createBidForm.addEventListener('submit', function (event) {
                            handleBidFormSubmit(event, telegramID, name);
                        });
                    };
                });

                const myBidsButton = document.getElementById('my-bids');
                myBidsButton.addEventListener('click', async function () {
                    await showMyBids(telegramID);
                });
                
                const lookChatsButton = document.getElementById('look-chats');
                lookChatsButton.addEventListener('click', async function () {
                    await showCustomerChats(telegramID);
                });
            } else {
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
                            await handleCityFormSubmit(event, telegramID);
                        });
                    };
                });

                const lookChatsButton = document.getElementById('look-chats');
                lookChatsButton.addEventListener('click', async function () {
                    await showPerformerChats(telegramID);
                });

                const changeProfileInfoButton = document.getElementById('change-profile-info');
                changeProfileInfoButton.addEventListener('click', async function () {
                    await showChangeProfileInfoForm();

                    // Attach submit form event listener
                    const changeProfileInfoForm = document.getElementById('change-profile-info-form');
                    if (changeProfileInfoForm) {
                        changeProfileInfoForm.addEventListener('submit', async function (event) {
                            await handleProfileInfoFormSubmit(event, telegramID);
                        });
                    };
                });
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


function handleBidFormSubmit(event, telegramID, name) {
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
            customer_telegram_id: telegramID,
            customer_name: name,
            city: city.value,
            description: description.value,
            deadline_from: deadlineFrom.value,
            deadline_to: deadlineTo.value,
            instrument_provided: instrumentProvided.value
        };
        console.log(data)

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


async function showMyBids(telegramID) {
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
                body: JSON.stringify({ customer_telegram_id: telegramID })  // Send the Telegram ID as JSON
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
                                            showMyBids(telegramID);
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


async function handleCityFormSubmit(event, telegramID) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const city = formData.get('city');
    
    if (city) {
        await showBids(city, telegramID);
    };
};


async function showBids(city, telegramID) {
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
                        <button class="bid-card-button" data-bid-id="${bid.id}">Откликнуться ☑️</button>
                    `;

                    bidCard.querySelector('.bid-card-button').addEventListener('click', async (event) => {
                        const bidID = event.target.getAttribute('data-bid-id');
                        
                        if (bidID) {
                            try {
                                fetch ('/respond-to-bid', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({ bid_id: bidID, performer_telegram_id: telegramID })
                                })
                                .then(response => response.json())
                                .then(data => {
                                    if (data.success) {
                                        showModal(data.message);
                                        showBids(city, telegramID);
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


async function showCustomerChats(telegramID) {
    // Fetch the list of performers who responded to the customer's bids
    try {
        const performers = await fetchPerformers(telegramID);

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
                button.addEventListener('click', () => loadChatHistory(telegramID, performer, 'customer'));
                performerList.appendChild(button);
            });
        };
    } catch (error) {
        console.error(`Error in showCustomerChats: ${error}`);
    };
};


async function loadChatHistory(telegramID, user, role) {
    const chatHistory = document.getElementById('chat-history');

    // Clear the chat history
    chatHistory.innerHTML = '';
    chatHistory.innerHTML = 'Загрузка...';

    try {
        // Fetch the chat history
        const response = role === 'customer' ?
            await fetch(`/get-chats?bid_id=${user.bidID}&customer_telegram_id=${telegramID}&performer_telegram_id=${user.telegramID}`) :
            await fetch(`/get-chats?bid_id=${user.bidID}&customer_telegram_id=${user.telegramID}&performer_telegram_id=${telegramID}`);

        const data = await response.json();

        if (data.success && Array.isArray(data.chatMessages) && data.chatMessages.length > 0) {
            chatHistory.innerHTML = data.chatMessages
                .map((msg) => `<div class="chat-message">${msg}</div>`)
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
            // Send the message
            const response = await fetch('/send-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    bid_id: user.bidID,
                    customer_telegram_id: role === 'customer' ? telegramID : user.telegramID,
                    performer_telegram_id: role === 'customer' ? user.telegramID : telegramID,
                    message,
                    sender_type: role
                 })
            });

            if (response.ok) {
                const currentDate = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });
                
                // Fetch missing customer name
                const response = await fetch('/get-user-data', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ telegram_id: telegramID })
                });

                if (!response.ok) {
                    showModal('Произошла ошибка при отправке сообщения, попробуйте перезайти в приложение');
                    return;
                };

                const userData = await response.json();
                const customerName = userData.userData.name;

                const chatHistory = document.getElementById('chat-history');

                chatHistory.innerHTML += `<div class="chat-message">${role === 'customer' ? `Заказчик ${customerName}` :
                                         `Мастер ${user.name}`}:\n${message}\n${currentDate}</div>`;
                messageInput.value = '';
            };
        };
    };
};


async function fetchPerformers(telegramID) {
    try {
        const response = await fetch(`/responded-performers?customer_telegram_id=${telegramID}`);
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


async function handleProfileInfoFormSubmit(event, telegramID) {
    event.preventDefault();

    const rate = document.getElementById('rate-input');
    const experience = document.getElementById('experience-input');

    if (!rate.value || !experience.value) {
        showModal('Пожалуйста, заполните все поля.');
        return;
    } else {
        const data = {
            telegram_id: telegramID,
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


async function showPerformerChats(telegramID) {
    // Fetch the list of customers who wrote to the performer
    try {
        const customers = await fetchCustomers(telegramID);

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
                button.addEventListener('click', () => loadChatHistory(telegramID, customer, 'performer'));
                customerList.appendChild(button);
            });
        };
    } catch (error) {
        console.error(`Error in showPerformerChats: ${error}`);
    };
};


async function fetchCustomers(telegramID) {
    try {
        const response = await fetch(`/responded-customers?performer_telegram_id=${telegramID}`);
        const data = await response.json();
        console.log(data);

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