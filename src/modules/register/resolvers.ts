import bcrypt from "bcryptjs";
import { IResolvers } from "graphql-tools";
import * as yup from "yup";
import { User } from "../../entity/User";
import { GQL } from "../../types/graphql";
import { createConfirmEmailLink } from "../../utils/createConfirmEmailLink";
import { formatYupError } from "../../utils/formatYupError";
import {
  duplicateEmail,
  emailNotLongEnough,
  invalidEmail,
  passwordNotLongEnough
} from "./constants";

const schema = yup.object().shape({
  email: yup
    .string()
    .min(3, emailNotLongEnough)
    .max(255)
    .email(invalidEmail),
  password: yup
    .string()
    .min(3, passwordNotLongEnough)
    .max(255)
});

export const resolvers: IResolvers = {
  Query: {
    bye: () => "bye"
  },
  Mutation: {
    register: async (_, args: GQL.IRegisterOnMutationArguments, { redis }) => {
      try {
        await schema.validate(args, { abortEarly: false });
      } catch (err) {
        return formatYupError(err);
      }

      const { email, password } = args;

      const userAlreadyExists = await User.findOne({
        where: { email },
        select: ["id"]
      });

      if (userAlreadyExists) {
        return [
          {
            path: "email",
            message: duplicateEmail
          }
        ];
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = User.create({
        email,
        password: hashedPassword
      });

      await user.save();

      await createConfirmEmailLink("", user.id, redis);
      return null;
    }
  }
};
