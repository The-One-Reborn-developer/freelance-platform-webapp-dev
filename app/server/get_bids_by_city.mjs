export function getBidsByCity(db, city) {
    try {
        const getBidsByCity = db.prepare(
            `SELECT (
            id,
            customer_telegram_id,
            customer_name,
            city,
            description,
            deadline_from,
            deadline_to,
            instrument_provided,
            closed) FROM bids WHERE city = ?`
        );
        const getBidsByCityResult = getBidsByCity.all(city);
        return getBidsByCityResult;
    } catch (error) {
        console.error('Error in getBidsByCity:', error);
        return [];
    };
};