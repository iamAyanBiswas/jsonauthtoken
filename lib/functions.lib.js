function algoMatching(algorithms, defaultOutput, input) {

    //check defaultOutput parameter
    if (!defaultOutput) throw new Error('defaultOutput parameter can not be empty')

    //find the correct algorithm name is given as 'input' or not , if is't return defaultOutput
    for (let i in algorithms) {
        if (String(algorithms[i]) === String(input)) defaultOutput = algorithms[i]
    }

    return defaultOutput
}


function parseExpiration(input) {
    const regex = /^(\d+)([mhdMHDyY]|MIN)$/; // Regex to match number + unit
    const match = input.match(regex);

    if (!match) {
        throw new Error('Invalid format. Use formats like 1M, 1Y, 1D, 1MIN.');
    }

    const amount = parseInt(match[1], 10);
    const unit = match[2].toLowerCase(); // Normalize to lowercase

    let seconds;

    switch (unit) {
        case 'y':
            seconds = amount * 365 * 24 * 60 * 60; // Years to seconds
            break;
        case 'm':
            seconds = amount * 30 * 24 * 60 * 60; // Months to seconds (approximation)
            break;
        case 'd':
            seconds = amount * 24 * 60 * 60; // Days to seconds
            break;
        case 'h':
            seconds = amount * 60 * 60; // Hours to seconds
            break;
        case 'min':
            seconds = amount * 60; // Minutes to seconds
            break;
        default:
            throw new Error('Unsupported time unit. Use M, Y, D, H, or MIN.');
    }


    return Math.floor(Date.now() / 1000) + seconds; // Current time + expiration time
}


function isExpired(timeStamp) {
    let currentTime = Math.floor(Date.now() / 1000)
    if (timeStamp < currentTime) {
        return true
    }
    else {
        return false
    }
}




export { algoMatching, parseExpiration, isExpired }