import { closeConnection } from "../config/mongoConnection.js";
import { User, Event, SignIn } from "../config/mongoCollections.js";
import { userData, eventData } from "../data/index.js";

console.log("Getting All Users...");
try {
  let users = await userData.getAllUsers();
  console.log(users);
} catch (e) {
  console.log("failed to get users: " + e);
}

console.log("\nGetting all Events...");
try {
  var events = await eventData.getAllEvents();
  console.log(events);
} catch (e) {
  console.log("failed to get events: " + e);
}

await closeConnection();
