import { eventData, userData } from "../data/index.ts"
import { type Event } from "../config/mongoCollections.ts"

try {
    const me = await userData.getUserByEmail("bennettwoods2004@gmail.com");

    const now = new Date();

    // sets the start and end to be an hour ahead of now and an hour behind now.
    const start = new Date(now.getTime() + 100);
    const end = new Date(now.getTime() + 60 * 60 * 1000);

    const ev = await eventData.createEvent(me._id.toString(), "Test Event - " + new Date().toString(), start, end, "Empty Description");

    console.log(`New event:\n${ev.name}`);
    console.log(`Event ID:\n${ev._id}`);
} catch (e) {
    console.log("Failed with: " + e);
}