import { ObjectId, Collection } from "mongodb";
import { events } from "../config/mongoCollections.ts";
import type { Event } from "../config/mongoCollections.ts";
import { validateStrAsObjectId, validateAndTrimString } from "../../../common/validation.ts";

// example data function
let exportedMethods = {
  async getAllEvents() {
    const eventCollection: Collection<Event> = await events();
    const eventList = await eventCollection.find({}).toArray();
    return eventList;
  },

  async getEventByID(id: string) {
      id = validateStrAsObjectId(id);
  
      const eventCollection = await events();
      const event = await eventCollection.findOne({ _id: new ObjectId(id) });
  
      if (!event) {
        throw new Error(`Could not find event with id: ${id}`);
      }
  
      return event;
    },

    async createEvent(createdBy: string, name: string, timeStart: Date, timeEnd: Date) {
      createdBy = validateStrAsObjectId(createdBy);

      name = validateAndTrimString(name, "Event Name", 5, 100);

      

    }
};

export default exportedMethods;
