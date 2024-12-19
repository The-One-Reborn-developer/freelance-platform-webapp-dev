export async function fetchCouriers(validatedTelegramID) {
    try {
        const response = await fetch(`/delivery/responded-couriers?customer_telegram_id=${validatedTelegramID}`);
        const data = await response.json();
        console.log(`data: ${JSON.stringify(data)}`);
        if (data.success) {
            return data.responses.map((res) => ({
                name: res.courier_name,
                dateOfBirth: res.courier_date_of_birth,
                hasCar: res.courier_has_car,
                carModel: res.courier_car_model,
                carDimensions: res.courier_car_dimensions,
                bidID: res.id,
                telegramID: res.courier_telegram_id,
                registration_date: res.courier_registration_date
            }));
        } else {
            return [];
        };
    } catch (error) {
        console.error(`Error in fetchCouriers: ${error}`);
        return [];
    };
};


export async function fetchCustomers(validatedTelegramID) {
    try {
        const response = await fetch(`/delivery/responded-customers?courier_telegram_id=${validatedTelegramID}`);
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