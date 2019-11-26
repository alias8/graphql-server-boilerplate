import request from "graphql-request";
import { User } from "../../entity/User";
import { createTypeormConnection } from "../../utils/createTypeormConnection";
import { host } from "./constants";

const email = "bob@email.com";
const password = "password123";

const mutation = `
    mutation {
        register(email: "${email}", password: "${password}") {
          path
          message
        }
    }
`;

beforeEach(async () => {
  await createTypeormConnection();
});

test("Register user", async () => {
  const response = await request(host, mutation);
  expect(response).toEqual({ register: null });
  const users = await User.find({ where: { email } });
  expect(users).toHaveLength(1);
  const user = users[0];
  expect(user.email).toEqual(email);
  expect(user.password).not.toEqual(password);
  expect(1).toEqual(1);

  // try to sign up again, should fail
  const response2: any = await request(host, mutation);
  expect(response2.register).toHaveLength(1);
  expect(response2.register[0].path).toEqual("email");
});
