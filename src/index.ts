import fs from "fs";
import { GraphQLSchema } from "graphql";
import { importSchema } from "graphql-import";
import { makeExecutableSchema, mergeSchemas } from "graphql-tools";
import { GraphQLServer } from "graphql-yoga";
import path from "path";
import "reflect-metadata";
import { createTypeormConnection } from "./utils/createTypeormConnection";

export const startServer = async () => {
  const schemas: GraphQLSchema[] = [];
  const folders = fs.readdirSync(path.join(__dirname, ".", "modules"));
  folders.forEach(folder => {
    const { resolvers } = require(path.join(
      __dirname,
      ".",
      "modules",
      folder,
      "resolvers"
    ));

    const typeDefs = importSchema(
      path.join(__dirname, ".", "modules", folder, "schema.graphql")
    );
    schemas.push(makeExecutableSchema({ resolvers, typeDefs }));
  });

  const server = new GraphQLServer({ schema: mergeSchemas({ schemas }) });
  await createTypeormConnection();
  await server.start();
  console.log("Server is running on localhost:4000");
};

startServer();
