export function updateCloseBid(db, bidID) {
    try {
        const closeBid = db.prepare(
            'UPDATE bids SET closed = TRUE WHERE id = ?'
        );
        const closeBidResult = closeBid.run(bidID);
        return closeBidResult;
    } catch (error) {
        console.error('Error in closeBid:', error);
    };
}