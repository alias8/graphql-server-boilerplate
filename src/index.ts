import { importSchema } from "graphql-import";
import { GraphQLServer } from "graphql-yoga";
import path from "path";
import "reflect-metadata";
import { resolvers } from "./resolvers";
import { createTypeormConnection } from "./utils/createTypeormConnection";

const typeDefs = importSchema(path.join(__dirname, ".", "schema.graphql"));

export const startServer = async () => {
  const server = new GraphQLServer({ typeDefs, resolvers });
  await createTypeormConnection();
  await server.start();
  console.log("Server is running on localhost:4000");
};

startServer();
