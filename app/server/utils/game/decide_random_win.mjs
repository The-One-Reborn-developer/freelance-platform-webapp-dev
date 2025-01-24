export function decideRandomWin(firstChoice, secondChoice) {
    if (firstChoice === undefined || secondChoice === undefined) {
        throw new Error('decideRandomWin: firstChoice or secondChoice is undefined');
    };

    const randomIndex = Math.floor(Math.random() * 2);
    return randomIndex === 0 ? firstChoice : secondChoice;
};