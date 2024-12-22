export function getDeliveriesByCity(db, city) {
    try {
        const getDeliveriesByCity = db.prepare(
            `SELECT id,
                    customer_telegram_id,
                    customer_name,
                    city,
                    description,
                    deliver_from,
                    deliver_to,
                    car_necessary,
                    closed
            FROM deliveries WHERE city = ? AND closed = FALSE`
        );
        const getDeliveriesByCityResult = getDeliveriesByCity.all(city);
        return getDeliveriesByCityResult;
    } catch (error) {
        console.error('Error in getDeliveriesByCity:', error);
        return [];
    };
};