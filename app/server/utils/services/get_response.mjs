export function getResponse(db, bidID) {
    try {
        const getResponse = db.prepare(
            'SELECT * FROM responses WHERE bid_id = ?'
        );
        const getResponseResult = getResponse.all(bidID);
        return getResponseResult;
    } catch (error) {
        console.error('Error in getResponse:', error);
    };
};