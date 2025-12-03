import { ObjectId, Collection } from "mongodb";
import { events } from "../config/mongoCollections.ts";
import type { Event } from "../config/mongoCollections.ts";
import { validateStrAsObjectId } from "../../../common/validation.ts";

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
};

export default exportedMethods;
