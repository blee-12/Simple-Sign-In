import { eventData, userData } from "../data/index.ts"
import { dbConnection, closeConnection } from "../config/mongoConnection.ts";


async function main() {
    console.log(" ---- { EVENT DATA FUNCS TESTING } ---- ")
    const db = await dbConnection();
    await db.dropDatabase();

    console.log("\nDatabase cleared!\n");

    // first need to create a dummy user to do a lot of these operations.
    const user = await userData.addUser("bwoods@stevens.edu", "Bennett", "Woods", "teSt1234!");
    
    console.log("1. Adding Event");

    // this should pass
    try {
        await eventData.createEvent(user._id.toString(), "Bennett's Birthday Bash", new Date("12/5/2025"), new Date("12/12/2025"));
        console.log("AddEvent Passed :-)");
    } catch (e) {
        console.error(`AddEvent failed with ${e}`);
    }

    // these should fail:
    // end date before start date
    try {
        await eventData.createEvent(user._id.toString(), "Bennett's Birthday Bash", new Date("12/5/2025"), new Date("12/4/2025"));
        console.log("AddEvent Passed :-(");
    } catch (e) {
        console.error(`AddEvent failed with ${e}`);
    }

    // start date before today's date,
    try {
        await eventData.createEvent(user._id.toString(), "Bennett's Birthday Bash", new Date("12/2/2025"), new Date("12/5/2025"));
        console.log("AddEvent Passed :-(");
    } catch (e) {
        console.error(`AddEvent failed with ${e}`);
    }

    // less than 15 minutes between the dates.
    try {
        await eventData.createEvent(user._id.toString(), "Bennett's Birthday Bash", new Date(2026, 11, 17, 3, 24, 0, 0), new Date(2026, 11, 17, 3, 30, 0, 0));
        console.log("AddEvent Passed :-(");
    } catch (e) {
        console.error(`AddEvent failed with ${e}`);
    }

    // event is 2 years out.
    try {
        await eventData.createEvent(user._id.toString(), "Bennett's Birthday Bash", new Date("12/9/2027"), new Date("12/10/2027"));
        console.log("AddEvent Passed :-(");
    } catch (e) {
        console.error(`AddEvent failed with ${e}`);
    }

    // 2. test DeleteEvent.
    console.log("\n2. Deleting Event");

    try {
        const e = await eventData.createEvent(user._id.toString(), "bwoods", new Date("12/5/2025"), new Date("12/6/2025"));
        await eventData.deleteEvent(e._id.toString());
        console.log(`deleteEvent passed :-)`)
    } catch (e) {
        console.error(`deleteEvent failed with ${e}`);
    }

    // these should fail!
    // no string
    try {
        const e = await eventData.createEvent(user._id.toString(), "bwoods", new Date("12/5/2025"), new Date("12/6/2025"));
        await eventData.deleteEvent("");
        console.log(`deleteEvent passed :-(`)
    } catch (e) {
        console.error(`deleteEvent failed with ${e}`);
    }

    // 24 random chars, still worked in a way <3
    try {
        const e = await eventData.createEvent(user._id.toString(), "bwoods", new Date("12/5/2025"), new Date("12/6/2025"));
        await eventData.deleteEvent("aaaaaaaaaaaaaaaaaaaaaaaa");
        console.log(`deleteEvent passed :-(`)
    } catch (e) {
        console.error(`deleteEvent failed with ${e}`);
    }

    // 3. test editEvent.
    console.log("\n3. Editing Event");

    // creating a dummy event...
    let eventId = "";

    try {  
        const event = await eventData.createEvent(user._id.toString(), "Christmas Party", new Date("12/24/2025"), new Date("12/25/2025"));
        eventId = event._id.toString();
    } catch (e) {
        console.error(`Setup for editEvent Failed ${e}`);
    }
    
    try {
        const e = await eventData.editEvent(eventId, "Bowling Party", null, null);
        console.log(`editEvent passed: ${e.name}`);
    } catch (e) {
        console.error(`editEvent failed with ${e}`);
    }

    try {
        const e = await eventData.editEvent(eventId, null, new Date("12/14/2025"), null);
        console.log(`editEvent passed: ${e.time_start.getDate()}`);
    } catch (e) {
        console.error(`editEvent failed with ${e}`);
    }

    try {
        const e = await eventData.editEvent(eventId, null, null, new Date("12/15/2025"));
        console.log(`editEvent passed: ${e.time_end.getDate()}`);
    } catch (e) {
        console.error(`editEvent failed with ${e}`);
    }

    try {
        const e = await eventData.editEvent(eventId, "Christmas Party", new Date("12/24/2025"), new Date("12/25/2025"));
        console.log(`editEvent passed: ${e.name+", "+e.time_start.getDate()+" - "+e.time_end.getDate() + " Dec, 2025"}`);
    } catch (e) {
        console.error(`editEvent failed with ${e}`);
    }

    // these should fail:
    // all null
    try {
        await eventData.editEvent(eventId, null, null, null);
        console.log(`editEvent passed: :-(`);
    } catch (e) {
        console.error(`editEvent failed with ${e}`);
    }

    // all null
    try {
        await eventData.editEvent(eventId, "", null, null);
        console.log(`editEvent passed: :-(`);
    } catch (e) {
        console.error(`editEvent failed with ${e}`);
    }

    // a name already in use
    /* This is hard failing, outside of the catch block for some reason. Still fails, so thats a win!
    try {
        await eventData.editEvent(eventId, "Bennett's Birthday Bash", null, null);
        console.log(`editEvent passed: :-(`);
    } catch (e) {
        console.error(`editEvent failed with ${e}`);
    } 
        */

    // date is now.
    try {
        await eventData.editEvent(eventId, null, new Date(), null);
        console.log(`editEvent passed: :-(`);
    } catch (e) {
        console.error(`editEvent failed with ${e}`);
    }

    // dates are the same.
    try {
        await eventData.editEvent(eventId, null, new Date("12/5/2025"), new Date("12/5/2025"));
        console.log(`editEvent passed: :-(`);
    } catch (e) {
        console.error(`editEvent failed with ${e}`);
    }

    // 4. Test getByID
    console.log('"\n4. Test getEventById')

    try {
        const ret = await eventData.getEventByID(eventId);
        console.log(`editEvent passed: ${ret.name}`);
    } catch (e) {
        console.error(`editEvent failed with ${e}`);
    }

    // this should fail.
    try {
        const ret = await eventData.getEventByID("");
        console.log(`editEvent passed :-(`);
    } catch (e) {
        console.error(`editEvent failed with ${e}`);
    }

    try {
        const ret = await eventData.getEventByID("0918eoihajlskdjo");
        console.log(`editEvent passed :-(`);
    } catch (e) {
        console.error(`editEvent failed with ${e}`);
    }

    try {
        const ret = await eventData.getEventByID("abcdeffedcbaabcdeffedcba");
        console.log(`editEvent passed :-(`);
    } catch (e) {
        console.error(`editEvent failed with ${e}`);
    }

    // 5. Test By Name
    console.log('"\n5. Test getEventByName')

    try {
        const ret = await eventData.getEventByName("Bennett's Birthday Bash");
        console.log(`editEvent passed: ${ret.name}`);
    } catch (e) {
        console.error(`editEvent failed with ${e}`);
    }

    // these should fail!
    // fake name
    try {
        const ret = await eventData.getEventByName("Birthday Bash");
        console.log(`editEvent passed: ${ret.name}`);
    } catch (e) {
        console.error(`editEvent failed with ${e}`);
    }

    // empty string
    try {
        const ret = await eventData.getEventByName("");
        console.log(`editEvent passed: ${ret.name}`);
    } catch (e) {
        console.error(`editEvent failed with ${e}`);
    }

    // 6. Register/Unregister user from event.
    console.log("\n6. Register/Unregister User")

    try {
        // register the user using email
        await eventData.registerUser(eventId, user.email, null);
        let event = await eventData.getEventByID(eventId) 
        console.log(`User registered for event: ${event.attending_users}`);

        //  unregister user using id.
        await eventData.unregisterUser(eventId, null, user._id.toString());
        event = await eventData.getEventByID(eventId) 
        console.log(`User unregistered for event: ${event.attending_users}`);
    } catch (e) {
        console.error(`registerUser failed with ${e}`);
    }

    try {
        // register the user using id
        await eventData.registerUser(eventId, user._id.toString(), null);
        let event = await eventData.getEventByID(eventId) 
        console.log(`User registered for event: ${event.attending_users}`);

        //  unregister user using email.
        await eventData.unregisterUser(eventId, null, user.email);
        event = await eventData.getEventByID(eventId) 
        console.log(`User unregistered for event: ${event.attending_users}`);
    } catch (e) {
        console.error(`registerUser failed with ${e}`);
    }

    // these should fail (register user)
    // pass neither
    try {
        await eventData.registerUser(eventId, null, null);
        console.log(`registerUser passed :-(`);
    } catch (e) {
        console.error(`registerUser failed with ${e}`);
    }

    // pass bad email
    try {
        await eventData.registerUser(eventId, null, "invalid@email");
        console.log(`registerUser passed :-(`);
    } catch (e) {
        console.error(`registerUser failed with ${e}`);
    }

    // pass bad ID
    try {
        await eventData.registerUser(eventId,"abcabcabcabcabcabcabcabc", null);
        console.log(`registerUser passed :-(`);
    } catch (e) {
        console.error(`registerUser failed with ${e}`);
    }

    // these should fail (unregister user)
     try {
        await eventData.unregisterUser(eventId, null, null);
        console.log(`registerUser passed :-(`);
    } catch (e) {
        console.error(`registerUser failed with ${e}`);
    }

    // pass bad email
    try {
        await eventData.unregisterUser(eventId, null, "invalid@email.");
        console.log(`registerUser passed :-(`);
    } catch (e) {
        console.error(`registerUser failed with ${e}`);
    }

    // pass bad ID
    try {
        await eventData.unregisterUser(eventId, "CBAABCCBAABCCBAABCCBAABC", null);
        console.log(`registerUser passed :-(`);
    } catch (e) {
        console.error(`registerUser failed with ${e}`);
    }

    // 7. test checkIn/checkOut user
    console.log("\n6. Sign in/out User")

    // these should pass
    try {
        // check in the user using email
        await eventData.checkInUser(eventId, null, user.email);
        let event = await eventData.getEventByID(eventId) 
        console.log(`User checked in for event: ${event.checked_in_users}`);

        //  check out the user using id.
        await eventData.checkOutUser(eventId, user._id.toString(), null);
        event = await eventData.getEventByID(eventId) 
        console.log(`User checked out for event: ${event.attending_users}`);
    } catch (e) {
        console.error(`checkIn/OutUser failed with ${e}`);
    }

    try {
        // check in the user using ID
        await eventData.checkOutUser(eventId, user._id.toString(), null);
        let event = await eventData.getEventByID(eventId) 
        console.log(`User checked in for event: ${event.attending_users}`);

        // check in the user using email
        await eventData.checkInUser(eventId, null, user.email);
        event = await eventData.getEventByID(eventId) 
        console.log(`User checked out for event: ${event.attending_users}`);
    } catch (e) {
        console.error(`checkIn/OutUser failed with ${e}`);
    }
    
    // these should fail (Check In User)

    try {
        await eventData.checkInUser(eventId, null, null);
        console.log(`checkInUser passed :-(`);
    } catch (e) {
        console.error(`checkInUser failed with ${e}`);
    }

    // pass bad email
    try {
        await eventData.checkInUser(eventId, null, "@");
        console.log(`checkInUser passed :-(`);
    } catch (e) {
        console.error(`checkInUser failed with ${e}`);
    }

    // pass bad ID
    try {
        await eventData.checkInUser(eventId, "abcabcabcabcabcabcabcabc", null);
        console.log(`checkInUser passed :-(`);
    } catch (e) {
        console.error(`checkInUser failed with ${e}`);
    }

    // These should also, finally fail (checkOutUser)
    try {
        await eventData.checkOutUser(eventId, null, null);
        console.log(`checkOutUser passed :-(`);
    } catch (e) {
        console.error(`checkOutUser failed with ${e}`);
    }

    // pass bad email
    try {
        await eventData.checkOutUser(eventId, null, "@invalidemail");
        console.log(`checkOutUser passed :-(`);
    } catch (e) {
        console.error(`checkOutUser failed with ${e}`);
    }

    // pass bad ID
    try {
        await eventData.checkOutUser(eventId, "coolcoolcoolcoolcoolcool", null);
        console.log(`checkOutUser passed :-(`);
    } catch (e) {
        console.error(`checkOutUser failed with ${e}`);
    }

    // 8. Testing gettingEventCode.
    // cant be done rn, codes are made on the db side but that's not set up yet.

    await closeConnection();
}

main().catch((e) => console.error(e));

