import { ObjectId, Collection } from "mongodb";
import { events, Event } from "../config/mongoCollections.js";

// example data function
let exportedMethods = {
  async getAllEvents() {
    const eventCollection: Collection<Event> = await events();
    const eventList = await eventCollection.find({}).toArray();
    return eventList;
  },
};

export default exportedMethods;
