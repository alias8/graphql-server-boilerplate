import { createConnection, getConnectionOptions } from "typeorm";

export const createTypeormConnection = async (env: string) => {
  const connectionOptions = await getConnectionOptions(env);
  return createConnection({ ...connectionOptions, name: "default" });
};
