export function getOpenBidByBidID(db, bidID) {
    try {
        const getBid = db.prepare(
            'SELECT * FROM bids WHERE id = ? AND closed = FALSE'
        );
        const getBidResult = getBid.get(bidID);
        return getBidResult;
    } catch (error) {
        console.error('Error in getBidByBidID:', error);
        return null;
    };
};