import request from "graphql-request";
import { User } from "../entity/User";
import { createTypeormConnection } from "../utils/createTypeormConnection";
import { host } from "./constants";

const email = "bob@email.com";
const password = "password123";

const mutation = `
    mutation {
        register(email: "${email}", password: "${password}")
    }
`;

beforeEach(async () => {
  await createTypeormConnection();
});

test("Register user", async () => {
  const response = await request(host, mutation);
  expect(response).toEqual({ register: true });
  const users = await User.find({ where: { email } });
  expect(users).toHaveLength(1);
  const user = users[0];
  expect(user.email).toEqual(email);
  expect(user.password).not.toEqual(password);
  expect(1).toEqual(1);
});
