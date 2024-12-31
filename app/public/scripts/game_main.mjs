import { 
    getQueryParameter,
    getUserData
} from "./modules/common_index.mjs";


window.onload = async function () {
    window.Telegram.WebApp.disableVerticalSwipes()

    const telegramID = getQueryParameter('telegram_id');
    if (telegramID) {
        try {
            const userData = await getUserData(telegramID);
            const validatedTelegramID = userData.userData.telegram_id;
            const name = userData.userData.game_name;
            const wallet = userData.userData.game_wallet;

            setupInterface(validatedTelegramID, name, wallet);
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


function setupInterface(validatedTelegramID, name, wallet) {
    const registrationDate = userData.userData.services_registration_date;

    const headerNav = document.getElementById('header-nav');
    const headerInfo = document.getElementById('header-user-info');

    if (!headerNav || !headerInfo) {
        console.error('Header navigation element not found');
        return;
    } else {
        try {
            headerInfo.innerHTML = `Игрок ${name}. Баланс: ${wallet}. Зарегистрирован ${registrationDate}.`;

            
        } catch (error) {
            console.error(`Error in setupInterface: ${error}`);
        };
    };
};
