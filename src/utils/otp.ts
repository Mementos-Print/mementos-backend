import randomstring from "randomstring";
import { EventRepository } from "../repositories/events.repository";

export const generateEventCode = async (): Promise<string> => {
  let eventCode: string;
  let codeExists: boolean;

  do {
    eventCode = randomstring.generate({
      length: 6,
      charset: "alphabetic",
    });

    codeExists = !!(await EventRepository.getEventById(eventCode));
  } while (codeExists);

  return eventCode;
};
// export const generateOtp = randomstring.generate({
//     length: 6,
//     charset: 'numeric'
// });