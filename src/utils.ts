export const sortById = (fieldA, fieldB): number => {
  if (fieldA.id > fieldB.id) {
    return 1;
  } else if (fieldA.id < fieldB.id) {
    return -1;
  } else {
    return 0;
  }
}

export const getTimeZoneOffset = (): string => {
  let timeZoneOffset = new Date().getTimezoneOffset();
  let offsetHours = Math.abs(Math.round(timeZoneOffset / 60)),
    offsetMinutes = Math.abs(timeZoneOffset % 60),
    offsetHoursString = offsetHours < 10 ? `0${offsetHours}` : `${offsetHours}`,
    offsetMinutesString = offsetMinutes < 10 ? `0${offsetMinutes}` : `${offsetMinutes}`;
  return `${timeZoneOffset < 0 ? '-' : ''}${offsetHoursString}:${offsetMinutesString}`;
}