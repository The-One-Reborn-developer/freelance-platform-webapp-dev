export function postResponse(
    db,
    bidID,
    performerTelegramID,
    performerName,
    performerRate,
    performerExperience,
    performerRegistrationDate) {
    try {
        const existingResponse = db.prepare(
            'SELECT * FROM services_responses WHERE bid_id = ? AND performer_telegram_id = ?'
        ).get(bidID, performerTelegramID);

        if (existingResponse) {
            console.log('User already responded to this bid.');
            return false;
        };
        
        const postResponse = db.prepare(
            `INSERT INTO services_responses (
                                    bid_id,
                                    performer_telegram_id,
                                    performer_name,
                                    performer_rate,
                                    performer_experience,
                                    performer_registration_date) VALUES (?, ?, ?, ?, ?, ?)`
                                );
        
        postResponse.run(
            bidID,
            performerTelegramID,
            performerName,
            performerRate,
            performerExperience,
            performerRegistrationDate
        );

        return true;
    } catch (error) {
        console.error('Error in postResponse:', error);
        return null;
    };
};