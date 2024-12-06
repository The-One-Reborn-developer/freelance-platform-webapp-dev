export function getResponse(db, bidID) {
    try {
        const getResponse = db.prepare(
            'SELECT * FROM responses WHERE bid_id = ?'
        );
        const getResponseResult = getResponse.all(bidID);
        console.log(`Responses for bid ${bidID}: ${getResponseResult}`);
        return getResponseResult;
    } catch (error) {
        console.error('Error in getResponse:', error);
    };
};