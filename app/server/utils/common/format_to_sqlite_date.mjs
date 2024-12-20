export function formatToSQLiteDate(date) {
    const isoDate = new Date(date).toISOString();
    return isoDate.replace('T', ' ').slice(0, 19); // Convert to "YYYY-MM-DD HH:MM:SS"
};