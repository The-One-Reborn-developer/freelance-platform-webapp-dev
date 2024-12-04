export function postBid(
    db,
    res,
    customerTelegramID,
    city,
    description,
    deadlineFrom,
    deadlineTo,
    instrumentProvided) {
    try {
        const postBid = db.prepare(
            'INSERT INTO bids (customer_telegram_id, city, description, deadline_from, deadline_to, instrument_provided) VALUES (?, ?, ?, ?, ?, ?)'
        );
        const postBidResult = postBid.run(
            customerTelegramID,
            city,
            description,
            deadlineFrom,
            deadlineTo,
            instrumentProvided
        );
        
        const newBidID = postBidResult.lastInsertRowid;
        res.status(201).json({
            success: true,
            message: `Заказ ${newBidID} успешно создан`
        });
    } catch (error) {
        console.error('Error in postBid:', error);
        res.status(500).json({ message: 'Произошла ошибка при создании заказа.' });
    };
};