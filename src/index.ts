import fs from "fs";
import { GraphQLSchema } from "graphql";
import { importSchema } from "graphql-import";
import { makeExecutableSchema, mergeSchemas } from "graphql-tools";
import { GraphQLServer } from "graphql-yoga";
import Redis from "ioredis";
import path from "path";
import "reflect-metadata";
import { User } from "./entity/User";
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

  const redis = new Redis();

  const server = new GraphQLServer({
    schema: mergeSchemas({ schemas }),
    context: ({ request }) => ({
      redis,
      url: request.protocol + "://" + request.get("host")
    })
  });

  // This is the route for the confirm email link
  server.express.get("/confirm/:id", async (req, res) => {
    const { id } = req.params;
    const userId = await redis.get(id);
    if (userId) {
      await User.update({ id: userId }, { confirmed: true });
      res.send("ok");
    } else {
      res.send("invalid");
    }
  });

  await createTypeormConnection(process.env.NODE_ENV as string);
  await server.start();
  console.log("Server is running on localhost:4000");
};

startServer();
