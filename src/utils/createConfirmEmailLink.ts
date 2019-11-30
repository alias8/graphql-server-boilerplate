import { Redis } from "ioredis";
import { v4 } from "uuid";

const SECOND = 1;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/*
 * When user signs up and gives their email address, we should
 * email them with a url to confirm their email address is real. eg.
 * https://my-site.com/confirm/<id>
 * */
export const createConfirmEmailLink = async (
  url: string,
  userID: string,
  redis: Redis
) => {
  const id = v4();
  await redis.set(id, userID, "ex", DAY); // set the
  return `${url}/confirm/${id}`;
};
