export function postResponse(
    db,
    deliveryID,
    courierTelegramID,
    courierName,
    courierDateOfBirth,
    courierHasCar,
    courierCarModel,
    courierCarWidth,
    courierCarLength,
    courierCarHeight,
    courierRegistrationDate
) {
    try {
        const existingResponse = db.prepare(
            'SELECT * FROM deliveries_responses WHERE delivery_id = ? AND courier_telegram_id = ?'
        ).get(bidID, courierTelegramID);

        if (existingResponse) {
            console.log('User already responded to this bid.');
            return false;
        };
        
        const postResponse = db.prepare(
            `INSERT INTO deliveries_responses (
                                    delivery_id,
                                    courier_telegram_id,
                                    courier_name,
                                    courier_date_of_birth,
                                    courier_has_car,
                                    courier_car_model,
                                    courier_car_dimensions_width,
                                    courier_car_dimensions_length,
                                    courier_car_dimensions_height,
                                    courier_registration_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
                                );
        
        postResponse.run(
            deliveryID,
            courierTelegramID,
            courierName,
            courierDateOfBirth,
            courierHasCar,
            courierCarModel,
            courierCarWidth,
            courierCarLength,
            courierCarHeight,
            courierRegistrationDate
        );

        return true;
    } catch (error) {
        console.error('Error in postResponse:', error);
        return null;
    };
};