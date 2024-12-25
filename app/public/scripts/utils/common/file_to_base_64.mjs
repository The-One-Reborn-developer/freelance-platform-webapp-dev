export function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            // Add the MIME type to the data URL
            const base64String = `data:${file.type};base64,${reader.result.split(',')[1]}`;
            resolve(base64String);
        }
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
};
