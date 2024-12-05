export function getBidByBidID(db, bidID) {
    try {
        const getBid = db.prepare(
            'SELECT * FROM bids WHERE id = ?'
        );
        const getBidResult = getBid.get(bidID);
        return getBidResult;
    } catch (error) {
        console.error('Error in getUser:', error);
        return null;
    };
}