export function jatTimeFormatter(input: JsonAuthTokenExpiry): number {
  // If number → assume seconds directly
  if (typeof input === 'number') {
    if (input <= 0) {
      throw new Error('Expiration time must be greater than zero.');
    }
    return Math.floor(Date.now() / 1000) + input;
  }

  const regex = /^(\d+)(S|MIN|H|D|M|Y)$/i;
  const match = input.match(regex);

  if (!match) {
    throw new Error('Invalid format. Use number or formats like 1S, 1MIN, 1H, 1D, 1M, or 1Y.');
  }

  const amount = parseInt(match[1], 10);
  const unit = match[2].toUpperCase() as TimeUnit;

  let seconds: number;
  switch (unit) {
    case 'S':   // seconds
      seconds = amount;
      break;
    case 'MIN': // minutes
      seconds = amount * 60;
      break;
    case 'H':   // hours
      seconds = amount * 60 * 60;
      break;
    case 'D':   // days
      seconds = amount * 24 * 60 * 60;
      break;
    case 'M':   // months (approx. 30 days)
      seconds = amount * 30 * 24 * 60 * 60;
      break;
    case 'Y':   // years (approx. 365 days)
      seconds = amount * 365 * 24 * 60 * 60;
      break;
    default:
      throw new Error(`Unsupported time unit: ${unit}`);
  }

  return Math.floor(Date.now() / 1000) + seconds;
}