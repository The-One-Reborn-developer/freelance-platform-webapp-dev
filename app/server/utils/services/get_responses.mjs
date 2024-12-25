import { getResponse } from './get_response.mjs';


export function getResponses(db, customerBids) {
    try {
        let responses = [];

        customerBids.forEach((bid) => {
            const responsesForBid = getResponse(db, bid.id);
            if (responsesForBid && responsesForBid.length > 0) {
                responses = responses.concat(
                    responsesForBid.map((response) => ({
                        id: response.id,
                        bidID: response.bid_id,
                        performerTelegramID: response.performer_telegram_id,
                        performerName: response.performer_name,
                        performerRate: response.performer_rate,
                        performerExperience: response.performer_experience,
                        performerRegistrationDate: response.performer_registration_date 
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
