import {v4 as uuidv4} from 'uuid';
import { findUserOrStaffByEmailOrID } from '../users/users.services.js';


export const generateAlphanumericId = async (tableName, staffOrUserID) => {
    let unique = false;
    let alphanumericId;
  
    while (!unique) {
      // Remove dashes and trim to desired length (e.g., 10 characters)
      alphanumericId = uuidv4().replace(/-/g, "");
      const existingID = await findUserOrStaffByEmailOrID(tableName, staffOrUserID, alphanumericId);
  
      if (existingID.rows.length === 0) unique = true;
    }
  
    return alphanumericId;
  };