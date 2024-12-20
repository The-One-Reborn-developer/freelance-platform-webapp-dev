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
                        deliveryID: response.delivery_id,
                        courierTelegramID: response.courier_telegram_id,
                        courierName: response.courier_name,
                        courierDateOfBirth: response.courier_date_of_birth,
                        courierHasCar: response.courier_has_car,
                        courierCarModel: response.courier_car_model,
                        courierCarWidth: response.courier_car_width,
                        courierCarLength: response.courier_car_length,
                        courierCarHeight: response.courier_car_height,
                        courierRegistrationDate: response.courier_registration_date 
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