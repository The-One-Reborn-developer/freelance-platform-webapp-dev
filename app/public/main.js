import getQueryParameter from "./utils/get_query_parameter.mjs";
import getUserData from "./utils/get_user_data.mjs";


window.onload = function () {
    const telegramID = getQueryParameter('telegram_id');
    console.log(telegramID);
    if (telegramID) {
        const userData = getUserData(telegramID);
        console.log(userData);
    };
};
