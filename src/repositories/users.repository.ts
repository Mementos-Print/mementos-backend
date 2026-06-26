import { Prisma } from "@prisma/client";
import { UserCredentialsDto } from "../dto/users";
import { db } from "../lib/db";

export class UserRepository {
  static async getUserByEmailTx(email: string, tx: Prisma.TransactionClient) {
    return tx.user.findUnique({
      where: { email },
    });
  };

  static CreateOrIgnore(data: UserCredentialsDto, tx: Prisma.TransactionClient) {
    return db.user.upsert({
      where: { email: data.email },
      update: {},
      create: {
        email: data.email,
        name: data.name,
        password: data.password,
      },
    });
  };

  static getUserByEmail(email: string) {
    return db.user.findUnique({
      where: {email}
    });
  };
}
