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

describe("Confirm email link", () => {
  it("works", async () => {
    const url = await createConfirmEmailLink(
      process.env.TEST_HOST as string,
      userID,
      new Redis()
    );
    const response = await fetch(url);
    const text = await response.text();
    expect(text).toEqual("ok");
  });
});
