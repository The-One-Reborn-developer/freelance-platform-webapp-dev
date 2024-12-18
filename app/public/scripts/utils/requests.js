export async function getUserData(telegramID) {
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


export async function fetchPerformers(validatedTelegramID) {
    try {
        const response = await fetch(`/responded-performers?customer_telegram_id=${validatedTelegramID}`);
        const data = await response.json();
        console.log(`data: ${JSON.stringify(data)}`);
        if (data.success) {
            return data.responses.map((res) => ({
                name: res.performerName,
                rate: res.performerRate,
                experience: res.performerExperience,
                bidID: res.bidID,
                telegramID: res.performerTelegramID,
                registration_date: res.performerRegistrationDate
            }));
        } else {
            return [];
        };
    } catch (error) {
        console.error(`Error in fetchPerformers: ${error}`);
        return [];
    };
};


export async function fetchCustomers(validatedTelegramID) {
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