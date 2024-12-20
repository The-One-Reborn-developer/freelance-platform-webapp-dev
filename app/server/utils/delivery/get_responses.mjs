import { getResponse } from '../../modules/delivery_index.mjs';


export function getResponses(db, customerDeliveries) {
    try {
        let responses = [];

        customerDeliveries.forEach((delivery) => {
            const responsesForDelivery = getResponse(db, delivery.id);
            if (responsesForDelivery && responsesForDelivery.length > 0) {
                responses = responses.concat(
                    responsesForDelivery.map((response) => ({
                        id: response.id,
                        delivery_id: response.delivery_id,
                        telegram_id: response.courier_telegram_id,
                        name: response.courier_name,
                        date_of_birth: response.courier_date_of_birth,
                        has_car: response.courier_has_car,
                        car_model: response.courier_car_model,
                        car_width: response.courier_car_width,
                        car_length: response.courier_car_length,
                        car_height: response.courier_car_height,
                        registration_date: response.courier_registration_date 
                    }))
                );
            };
        });

        return responses;
    } catch (error) {
        console.error('Error in getResponses:', error);
        return [];
    };
};