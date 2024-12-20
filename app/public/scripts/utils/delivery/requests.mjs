export async function fetchCouriers(validatedTelegramID) {
    try {
        const response = await fetch(`/delivery/responded-couriers?customer_telegram_id=${validatedTelegramID}`);
        const data = await response.json();
        console.log(`data: ${JSON.stringify(data)}`)
        if (data.success) {
            return data.responses.map((res) => ({
                name: res.courier_name,
                date_of_birth: res.courier_date_of_birth,
                has_car: res.courier_has_car,
                car_model: res.courier_car_model,
                car_width: res.courier_car_width,
                car_length: res.courier_car_length,
                car_height: res.courier_car_height,
                delivery_id: res.id,
                telegram_id: res.courier_telegram_id,
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

        if (data.success && Array.isArray(data.deliveriesInfo)) {
            return data.deliveriesInfo.map((res) => ({
                name: res.customer_name,
                deliveryID: res.id,
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