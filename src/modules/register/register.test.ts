import request from "graphql-request";
import { annotateWithChildrenErrors } from "graphql-tools/dist/stitching/errors";
import { getConnection } from "typeorm";
import { User } from "../../entity/User";
import { createTypeormConnection } from "../../utils/createTypeormConnection";
import {
  duplicateEmail,
  emailNotLongEnough,
  host,
  invalidEmail,
  passwordNotLongEnough
} from "./constants";

const email = "bob@email.com";
const password = "password";

const mutation = (emailParam: string, passwordParam: string) => `
    mutation {
        register(email: "${emailParam}", password: "${passwordParam}") {
          path
          message
        }
    }
`;

beforeEach(async () => {
  await createTypeormConnection(process.env.NODE_ENV as string);
});

afterEach(async () => {
  const connection = await getConnection();
  await connection.close();
});

async function registerUser() {
  const response = await request(host, mutation(email, password));
  expect(response).toEqual({ register: null });
  const users = await User.find({ where: { email } });
  expect(users).toHaveLength(1);
  const user = users[0];
  expect(user.email).toEqual(email);
  expect(user.password).not.toEqual(password);
}

describe("registration", () => {
  test("Register user", async () => {
    await registerUser();
  });

  test("Register user with same email should fail", async () => {
    await registerUser();
    // try to sign up again, should fail
    const response: any = await request(host, mutation(email, password));
    expect(response).toEqual({
      register: [
        {
          message: duplicateEmail,
          path: "email"
        }
      ]
    });
  });

  test("Catch error when email has error", async () => {
    const response: any = await request(host, mutation("b", password));
    expect(response).toEqual({
      register: [
        {
          path: "email",
          message: emailNotLongEnough
        },
        {
          path: "email",
          message: invalidEmail
        }
      ]
    });
  });

  test("Catch error when bad password is used", async () => {
    const response: any = await request(host, mutation(email, "pa"));
    expect(response).toEqual({
      register: [
        {
          path: "password",
          message: passwordNotLongEnough
        }
      ]
    });
  });
});
