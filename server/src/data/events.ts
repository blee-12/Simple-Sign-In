import { ObjectId, Collection } from "mongodb";
import { events } from "../config/mongoCollections.ts";
import type { Event, User, SignIn } from "../config/mongoCollections.ts";
import { validateStrAsObjectId, validateAndTrimString, validateStartEndDates, validateEmail } from "../../../common/validation.ts";
import { userData } from "./index.ts";

async function isEventNameInUse(name: string) {
  const eventCollection = await events();
  let sameName = await eventCollection.findOne( { name } );
  if (sameName) throw new Error(`Event name "${name}" is already in use`);
}

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

    async createEvent(created_by: string, name: string, time_start: Date, time_end: Date) {
      created_by = validateStrAsObjectId(created_by);

      name = validateAndTrimString(name, "Event Name", 5, 100);

      validateStartEndDates(time_start, time_end);

      const event: Event = {
        _id: new ObjectId(),
        name,
        time_start,
        time_end, 
        created_by: new ObjectId(created_by),
        attending_users: [],
        checked_in_users: [],
        code: null
      }

      const eventCollection = await events();
      const e = await eventCollection.insertOne(event);

      if (!e) {
        throw new Error(`Could not create event ${name}`);
      }

      return event;
    },

    async deleteEvent(id: string){
      id = validateStrAsObjectId(id);

      let oldEvent = await this.getEventByID(id);
      if (!oldEvent) throw new Error("Event not found!");

      const eventCollection = await events();
      let ret = await eventCollection.deleteOne( { _id: new ObjectId(id) } );

      if (!ret) throw new Error("Event could not be deleted");

      return ret;
    },

    async editEvent(id: string, name: string | null, time_start: Date | null, time_end: Date | null){
      id = validateStrAsObjectId(id);

      let event: Event = await this.getEventByID(id);
      if (!event) throw new Error("Event not found!");

      let modified = false;

      if (name) {
        name = validateAndTrimString(name, "Event Name", 5, 100);
        isEventNameInUse(name);
        event.name = name;
        modified = true;
      } 

      if (time_start && time_end) {
        validateStartEndDates(time_start, time_end);
        event.time_start = time_start;
        event.time_end = time_end;
        modified = true;
      } else if (time_start) {
        validateStartEndDates(time_start, event.time_end);
        event.time_start = time_start;
        modified = true;
      } else if (time_end) {
        validateStartEndDates(event.time_start, time_end);
        event.time_end = time_end;
        modified = true;
      }

      if (!modified) {
        throw new Error("Must supply one field from {name, time_start, time_end} to modify!");
      }

      const eventCollection = await events();
      const ret = await eventCollection.findOneAndUpdate({ _id: new ObjectId(id) }, 
        { $set: 
          { 
            name: event.name, 
            time_start: event.time_start,
            time_end: event.time_end,
          }
        }
      );
      
      if (!ret) {
        throw new Error(`could not edit event ${event.name}!`);
      }
  
      return ret;
    },

    async getEventByName(name: string) {
      name = validateAndTrimString(name, "Name", 5, 100);
      
      const eventCollection = await events();
      let event = eventCollection.findOne({ name });

      if (!event) throw new Error("Event could not be found!");

      return event;
    },

    async registerUser(eventId: string, email: string | null, userID: string | null ){
      eventId = validateStrAsObjectId(eventId);

      let user: User | null = null;
      if (email) {
        user = await userData.getUserByEmail(email); 
      } else if (userID) {
        user = await userData.getUserByID(userID);
      } 

      if (!user) throw new Error("Must provide an email or userID to sign a user in!")
      
      const eventCollection = await events();
      const event = await eventCollection.findOneAndUpdate({ _id: new ObjectId(eventId) }, { $addToSet: { attending_users: user.email }});
      if (!event) throw new Error("Couldn't add user to event!");

      return event;
    },

    async signInUser(eventId:string, userID: string | null, email: string | null){
      eventId = validateStrAsObjectId(eventId);

      let user: User | null = null;
      if (email) {
        user = await userData.getUserByEmail(email); 
      } else if (userID) {
        user = await userData.getUserByID(userID);
      } 

      if (!user) throw new Error("Must provide an email or userID to sign a user in!");

      let signin: SignIn = {
        userID: user._id,
        timestamp: new Date(),
      }

      const eventCollection = await events();
      const event = await eventCollection.findOneAndUpdate({ _id: new ObjectId(eventId) }, { $addToSet: { checked_in_users: signin }})
      if (!event) throw new Error("Couldn't add user to event!");

      return event;
    },

    async unregisterUser(eventId:string, userID: string | null, email: string | null) {
      eventId = validateStrAsObjectId(eventId);

      let user: User | null = null;
      if (email) {
        user = await userData.getUserByEmail(email); 
      } else if (userID) {
        user = await userData.getUserByID(userID);
      } 

      if (!user) throw new Error("Must provide an email or userID to unregister a user!");
      
      const eventCollection = await events();
      await eventCollection.findOneAndUpdate({ _id: new ObjectId(eventId) }, { $pull: { attending_users: user.email }})
    },

    async signOut(eventId:string, userID: string | null, email: string | null) {
      eventId = validateStrAsObjectId(eventId);

      let user: User | null = null;
      if (email) {
        user = await userData.getUserByEmail(email); 
      } else if (userID) {
        user = await userData.getUserByID(userID);
      } 

      if (!user) throw new Error("Must provide an email or userID to sign out a user!");

      const eventCollection = await events();
      const updateInfo = await eventCollection.findOneAndUpdate(
        { _id: new ObjectId(eventId) },
        {
          $pull: {
            checked_in_users: {
                userID: user._id 
            } 
          }
        } as any, 
        { returnDocument: 'after' }
      );

      if (!updateInfo) throw new Error("Could not remove check-in.");

      return user;
    },

    async getEventCode(eventId: string) {
      eventId = validateStrAsObjectId(eventId);

      const eventCollection = await events();
      let event = await eventCollection.findOne( {_id: new ObjectId(eventId)} );

      if (!event) throw new Error("Event could not be found!")

      return event.code;
      
    }
};

export default exportedMethods;
