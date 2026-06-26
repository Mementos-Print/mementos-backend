import bcrypt from "bcrypt";

export class Crypt {
  static async hash(password: string) {
    const salt = await bcrypt.genSalt(10);

    return await bcrypt.hash(password, salt);
  }

  static async compare(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }
}
