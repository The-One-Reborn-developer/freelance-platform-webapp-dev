export function postResponse(
    db,
    bidID,
    performerTelegramID,
    performerName,
    performerRate,
    performerExperience) {
    try {
        console.log(`bidID: ${bidID}, performerTelegramID: ${performerTelegramID}, performerName: ${performerName}, performerRate: ${performerRate}, performerExperience: ${performerExperience}`);

        const postResponse = db.prepare(
            `INSERT INTO responses (bid_id,
                                    performer_telegram_id,
                                    performer_name,
                                    performer_rate,
                                    performer_experience) VALUES (?, ?, ?, ?, ?)`
                                );
        
        const postResponseResult = postResponse.run(
            bidID,
            performerTelegramID,
            performerName,
            performerRate,
            performerExperience
        );

        return postResponseResult;
    } catch (error) {
        console.error('Error in postResponse:', error);
    };
};