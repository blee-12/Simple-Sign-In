import { userData } from "../data/index.ts"
import { dbConnection, closeConnection } from "../config/mongoConnection.ts";


async function main() {
    console.log(" ---- { USER DATA FUNCS TESTING } ---- ")

    // testing adding a user.
    const db = await dbConnection();
    await db.dropDatabase();

    console.log("\nDatabase cleared!\n");

    console.log("1. Adding a user");

    // this is should pass
    try {
        await userData.addUser("bwoods@stevens.edu", "Bennett", "Woods", "teSt1234!");
        console.log("User Succesfully Added!")
    } catch (e) {
        console.error(`AddUser Failed with: ${e}`);
    }

    // these should fail.
    
    // invalid email
    try {
        await userData.addUser("bwoods@stevensedu", "Bennett", "Woods", "test1234!");
    } catch (e) {
        console.error(`AddUser Failed with: ${e}`);
    }
    
    // repetitive email
    try {
        await userData.addUser("bwoods@stevens.edu", "Bennett", "Woods", "test1234!");
    } catch (e) {
        console.error(`AddUser Failed with: ${e}`);
    }
    
    // empty firstname
    try {
        await userData.addUser("noddea@stevens.edu", "", "Woods", "test1234!");
    } catch (e) {
        console.error(`AddUser Failed with: ${e}`);
    }

    // empty last name 
    try {
        await userData.addUser("noddea@stevens.edu", "RealFirstName", "", "test1234!");
    } catch (e) {
        console.error(`AddUser Failed with: ${e}`);
    }

    // invalid password 
    try {
        await userData.addUser("noddea@stevens.edu", "asd", "qwe", "test");
    } catch (e) {
        console.error(`AddUser Failed with: ${e}`);
    }

    
    // 2. Test Edit
    console.log("\n2. Editing a User");

    // this should pass
    try {
        const u = await userData.editUser("bwoods@stevens.edu", null, "wood");
        console.log(`User succesfully edited: ${u.first_name + " " + u.last_name}`)
    } catch (e) {
        console.error(`EditUser Failed with: ${e}`)
    }

    // this should pass
    try {
        const u = await userData.editUser("bwoods@stevens.edu", "benit", null);
        console.log(`User succesfully edited: ${u.first_name + " " + u.last_name}`)
    } catch (e) {
        console.error(`EditUser Failed with: ${e}`)
    }

    // this should also pass.
    try {
        const u = await userData.editUser("bwoods@stevens.edu", "Bennett", "Woods");
        console.log(`User succesfully edited: ${u.first_name + " " + u.last_name}`)
    } catch (e) {
        console.error(`EditUser Failed with: ${e}`)
    }

    // these should fail. 
    // no changes sent.
    try {
        await userData.editUser("bwoods@stevens.edu", null, null);
    } catch (e) {
        console.error(`EditUser Failed with: ${e}`)
    }

    // both empty strings
    try {
        await userData.editUser("bwoods@stevens.edu", "", "");
    } catch (e) {
        console.error(`EditUser Failed with: ${e}`)
    }

    // one empty string, one null.
    try {
        await userData.editUser("bwoods@stevens.edu", "", null);
    } catch (e) {
        console.error(`EditUser Failed with: ${e}`)
    }

    // 3. Test Get User By email
    console.log("\n3. Get User By Email");
    
    // this should work!
    try {
        await userData.getUserByEmail("bwoods@stevens.edu");
        console.log("GetUserByEmail Passed :-)")
    } catch (e) {
        console.error(`GetUserByEmail failed with: ${e}`)
    }

    // these should fail: 
    // empty string.
    try {
        await userData.getUserByEmail("");
    } catch (e) {
        console.error(`GetUserByEmail failed with: ${e}`)
    }

    // No user with this email.
    try {
        await userData.getUserByEmail("whattheheck@cool.com");
    } catch (e) {
        console.error(`GetUserByEmail failed with: ${e}`)
    }

    // fail 2 
    try {
        await userData.getUserByEmail("whattheheck@cool.");
    } catch (e) {
        console.error(`GetUserByEmail failed with: ${e}`)
    }
    
    // fails 3
    try {
        await userData.getUserByEmail("whattheheck@.com");
    } catch (e) {
        console.error(`GetUserByEmail failed with: ${e}`)
    }

    // for testing: 
    const user = await userData.getUserByEmail("bwoods@stevens.edu")

    // 4. Test Get User By ID
    console.log("\n4. Get User By ID");

    try {
        await userData.getUserByID(user._id.toString());
        console.log("getUserByID Passed :-)")
    } catch (e) {
        console.error(`getUserByID failed with: ${e}`)
    }

    // this should fail:
    try {
        await userData.getUserByID("erm");
        console.log("getUserByID Passed :-(")
    } catch (e) {
        console.error(`getUserByID failed with: ${e}`)
    }

    try {
        await userData.getUserByID("0192830918230918230918231");
        console.log("getUserByID Passed :-(")
    } catch (e) {
        console.error(`getUserByID failed with: ${e}`)
    }

    // 5. Test get all users
    console.log("\n5. Get All Users");

    try {
        console.log(await userData.getAllUsers());
    } catch (e) {
        console.error(`getAllUsers failed with: ${e}`)
    }

    // 5. Test remove user (same logic as get by ID, not too worried)
    console.log("\n5. Get All Users");

    try {
        console.log(await userData.deleteUser(user._id.toString()));
        console.log("deleteUser Passed :-)")
    } catch (e) {
        console.error(`getAllUsers failed with: ${e}`)
    }

    await closeConnection();
}

main().catch((e) => console.error(e));
await closeConnection();