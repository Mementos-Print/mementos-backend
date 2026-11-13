import { Prisma } from "@prisma/client";
import { CreateEventDto } from "../dto/event";
import { db } from "../lib/db";

export class EventRepository {
  static create(data: CreateEventDto, tx: Prisma.TransactionClient) {
    return tx.event.create({ data });
  }

  static getEventById(id: string) {
    return db.event.findUnique({ where: { id } });
  }
}
