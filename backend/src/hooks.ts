import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { CanteenInfo } from "./types";

dayjs.extend(utc);

const getCurrentTime = () => dayjs().utcOffset(8 * 60);

const timeToTimestampUTCPlus8 = (time: string, base: dayjs.Dayjs) => {
  const [hours, minutes] = time.split(":").map(Number);
  return base.hour(hours).minute(minutes).second(0).millisecond(0).valueOf();
};

const getCanteenStatus = (times: CanteenInfo["times"], now: dayjs.Dayjs) => {
  const nowTs = now.valueOf();
  let status = "closed";
  let next: number | null = null;
  let remaining: number | null = null;

  for (const time of times) {
    const startTs = timeToTimestampUTCPlus8(time.start, now);
    const endTs = timeToTimestampUTCPlus8(time.end, now);
    if (startTs <= nowTs && nowTs <= endTs) {
      status = "open";
      remaining = endTs - nowTs;
      break;
    } else if (startTs >= nowTs) {
      next = startTs - nowTs;
      break;
    }
  }

  return { status, remaining, next };
};

export { getCurrentTime, getCanteenStatus };