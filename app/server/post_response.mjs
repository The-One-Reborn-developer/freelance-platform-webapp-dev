export function postResponse(
    db,
    res,
    bidID,
    performerTelegramID,
    performerName,
    performerRate,
    performerExperience) {
    try {
        const postResponse = db.prepare(
            `INSERT INTO responses (bid_id,
                                    performer_telegram_id,
                                    performer_full_name,
                                    performer_rate,
                                    performer_experience,
                                    chat_started) VALUES (?, ?, ?, ?, ?, ?)`
                                );
        
        const postResponseResult = postResponse.run(
            bidID,
            performerTelegramID,
            performerName,
            performerRate,
            performerExperience,
            false
        );

        return postResponseResult;
    } catch (error) {
        console.error('Error in postResponse:', error);
    };
};