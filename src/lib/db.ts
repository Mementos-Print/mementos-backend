import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "./env";

const adapter = new PrismaPg(
  {
    connectionString: env.DATABASE_URL,
  }
);

export const db = new PrismaClient({ adapter });
export async function connectDb() {
  await db.$connect();
}
