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
                            handleBidFormSubmit(event, telegramID);
                        });
                    };
                });

                const myBidsButton = document.getElementById('my-bids');
                myBidsButton.addEventListener('click', async function () {
                    await showMyBids(telegramID);
                });
                // TODO: chats display
                const lookChatsButton = document.getElementById('look-chats');
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
                        selectCityForm.addEventListener('submit', function (event) {
                            handleCityFormSubmit(event);
                        });
                    };
                });
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

            const searchMaterialsButton = document.createElement('button');
            searchMaterialsButton.className = 'header-button';
            searchMaterialsButton.id = 'search-materials';
            searchMaterialsButton.textContent = ' 🧱';

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
            };

            const formHTML = await response.text();

            display.innerHTML = formHTML;
        } catch (error) {
            console.error(`Error in showCreateBidForm: ${error}`);
        };
    };
};


function handleBidFormSubmit(event, telegramID) {
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
                        <p><strong>Город:</strong> ${bid.city}</p>
                        <br>
                        <p><strong>Описание:</strong> ${bid.description}</p>
                        <br>
                        <p><strong>Срок с:</strong> ${bid.deadline_from}</p>
                        <p><strong>Срок до:</strong> ${bid.deadline_to}</p>
                        <br>
                        <p><strong>Предоставляется инструмент:</strong> ${bid.instrument_provided ? 'Да' : 'Нет'}</p>
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


function handleCityFormSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const city = formData.get('city');
    
    if (city) {
        showBids(city);
    };
};


async function showBids(city) {
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

            const bids = await response.json();

            if (bids.length > 0) {
                const bidsContainer = document.createElement('div');
                bidsContainer.classList.add('bids-container');

                bids.forEach(bid => {
                    const bidCard = document.createElement('div');
                    bidCard.classList.add('bid-card');

                    // TODO: get customer name by Telegram ID

                    bidCard.innerHTML = `
                        <p><strong>Заказчик:</strong> ${'placeholder for customer '}</p>
                        <br>
                        <p><strong>Описание:</strong> ${bid.description}</p>
                        <br>
                        <p><strong>Срок от:</strong> ${bid.deadline_from}</p>
                        <p><strong>Срок до:</strong> ${bid.deadline_to}</p>
                        <br>
                        <p><strong>Предоставляется инструмент:</strong> ${bid.instrument_provided ? 'Да' : 'Нет'}</p>
                        <button class="bid-card-button" data-bid-id="${bid.id}">Откликнуться ☑️</button>
                    `;

                    bidCard.querySelector('.bid-card-button').addEventListener('click', async (event) => {
                        const bidID = event.target.getAttribute('data-bid-id');
                        
                        if (bidID) {
                            try {
                                // TODO: respond to bid
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