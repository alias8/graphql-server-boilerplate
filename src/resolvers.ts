import bcryptjs from "bcryptjs";
import { IResolvers } from "graphql-tools";
import { User } from "./entity/User";
import { GQL } from "./types/graphql";

export const resolvers: IResolvers = {
  Query: {
    hello: (_: any, { name }: GQL.IHelloOnQueryArguments) =>
      `Hello ${name || "World"}`
  },
  Mutation: {
    register: async (
      _,
      { email, password }: GQL.IRegisterOnMutationArguments
    ) => {
      const hashedPassword = await bcryptjs.hash(password, 10);
      const user = await User.create({
        email,
        password: hashedPassword
      });
      user.save();
      return true;
    }
  }
};
