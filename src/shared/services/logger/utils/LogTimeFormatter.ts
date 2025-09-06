/**
 * Format timestamp to EST/EDT with AM/PM
 */
export const formatTimeEST = (date: Date): string => {
  // Use Intl.DateTimeFormat to properly handle EST/EDT
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "America/New_York", // This handles EST/EDT automatically
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    fractionalSecondDigits: 3,
  };

  const formatter = new Intl.DateTimeFormat("en-US", options);
  const parts = formatter.formatToParts(date);

  // Extract the parts
  let hour = "";
  let minute = "";
  let second = "";
  let fractionalSecond = "";
  let dayPeriod = "";

  for (const part of parts) {
    switch (part.type) {
      case "hour":
        hour = part.value;
        break;
      case "minute":
        minute = part.value;
        break;
      case "second":
        second = part.value;
        break;
      case "fractionalSecond":
        fractionalSecond = part.value;
        break;
      case "dayPeriod":
        dayPeriod = part.value;
        break;
    }
  }

  return `${hour}:${minute}:${second}.${fractionalSecond} ${dayPeriod}`;
};
