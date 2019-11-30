import fs from "fs";
import { GraphQLSchema } from "graphql";
import { importSchema } from "graphql-import";
import { makeExecutableSchema, mergeSchemas } from "graphql-tools";
import { GraphQLServer } from "graphql-yoga";
import Redis from "ioredis";
import path from "path";
import "reflect-metadata";
import { User } from "./entity/User";
import { confirmEmail } from "./routes/confirmEmail";
import { createTypeormConnection } from "./utils/createTypeormConnection";
import { genSchemas } from "./utils/generateSchema";

export const redis = new Redis();

export const startServer = async () => {
  const server = new GraphQLServer({
    schema: genSchemas(),
    context: ({ request }) => ({
      redis,
      url: request.protocol + "://" + request.get("host")
    })
  });

  // This is the route for the confirm email link
  /*
   * When called, this route will set the User in postgres db
   * to be confirmed
   * */
  server.express.get("/confirm/:id", confirmEmail);

  await createTypeormConnection(process.env.NODE_ENV as string);
  await server.start();
  console.log("Server is running on localhost:4000");
};

startServer();
