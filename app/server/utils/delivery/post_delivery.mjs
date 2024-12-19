export function postDelivery(
    db,
    res,
    customerTelegramID,
    customerName,
    city,
    description,
    deliverFrom,
    deliverTo,
    carNecessary) {
    try {
        const postDelivery = db.prepare(
            `INSERT INTO deliveries (
                         customer_telegram_id,
                         customer_name,
                         city,
                         description,
                         deliver_from,
                         deliver_to,
                         car_necessary)
            VALUES (?, ?, ?, ?, ?, ?, ?)`
        );
        
        const sanitizedCarNecessary = carNecessary === 'true' ? 1 : 0;

        const postDeliveryResult = postDelivery.run(
            customerTelegramID,
            customerName,
            city,
            description,
            deliverFrom,
            deliverTo,
            sanitizedCarNecessary
        );
        
        const newDeliveryID = postDeliveryResult.lastInsertRowid;
        res.status(201).json({
            success: true,
            message: `Заказ №${newDeliveryID} успешно создан.`
        });
    } catch (error) {
        console.error('Error in postDelivery:', error);
        res.status(500).json({ message: 'Произошла ошибка при создании заказа.' });
    };
};