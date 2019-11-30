import Redis from "ioredis";
import fetch from "node-fetch";
import { getConnection } from "typeorm";
import { User } from "../entity/User";
import { createConfirmEmailLink } from "./createConfirmEmailLink";
import { createTypeormConnection } from "./createTypeormConnection";

let userID: string;
beforeEach(async () => {
  await createTypeormConnection(process.env.NODE_ENV as string);
  const user = await User.create({
    email: "test@email.com",
    password: "password123"
  }).save();
  userID = user.id;
});

afterEach(async () => {
  const connection = await getConnection();
  await connection.close();
});

test("Make sure it confirms user and clears key in redis", async () => {
  const redis = new Redis();
  const url = await createConfirmEmailLink(
    process.env.TEST_HOST as string,
    userID,
    redis
  );
  const response = await fetch(url);
  const text = await response.text();
  expect(text).toEqual("ok");
  const user = await User.findOne({ where: { id: userID } });
  expect(user!.confirmed).toEqual(true);
  expect(redis.get(user!.id));

  // Why are we using redis at all? why not store the confirmation
  // id as part of the User entry in postgres?
  const chunks = url.split("/");
  const key = chunks[chunks.length - 1];
  const value = await redis.get(key);
  expect(value).toBeNull();
});
