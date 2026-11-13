import { db } from "../lib/db";

export class EventService {
  static createEvent(title: string, staff_id: string, event_date: string) {
    return db.$transaction(async (tx) => {
        
    });
  }
}
