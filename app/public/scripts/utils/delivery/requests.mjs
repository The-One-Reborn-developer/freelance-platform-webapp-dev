export async function fetchCouriers(validatedTelegramID) {
    try {
        const response = await fetch(`/delivery/responded-couriers?customer_telegram_id=${validatedTelegramID}`);
        const data = await response.json();
        
        if (data.success) {
            return data.responses.map((res) => ({
                name: res.name,
                date_of_birth: res.date_of_birth,
                has_car: res.has_car,
                car_model: res.car_model,
                car_width: res.car_width,
                car_length: res.car_length,
                car_height: res.car_height,
                delivery_id: res.delivery_id,
                telegram_id: res.telegram_id,
                registration_date: res.registration_date
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
                delivery_id: res.id,
                telegram_id: res.customer_telegram_id
            }));
        } else {
            return [];
        };
    } catch (error) {
        console.error(`Error in fetchCustomers: ${error}`);
        return [];
    };
};