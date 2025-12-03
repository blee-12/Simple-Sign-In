import { dbConnection, closeConnection } from "../config/mongoConnection.ts";
import { userData } from "../data/index.ts";

async function main() {
  console.log("--- Starting User Tests ---");
  const db = await dbConnection();
  await db.dropDatabase();

  let firstUserId: string = "";

  // test addUser (should pass)
  try {
    console.log("1. Testing addUser (Valid)...");
    const newUser = await userData.addUser(
      "john@example.com",
      "John",
      "Doe",
      "Password123!"
    );

    if (newUser.email === "john@example.com" && newUser._id) {
      firstUserId = newUser._id.toString();
      console.log("PASS: User created successfully.");
    } else {
      console.error("FAIL: User created but data mismatch.");
    }
  } catch (e) {
    console.error(`FAIL: Error thrown: ${e}`);
  }

  // test addUser (should fail)
  try {
    console.log("2. Testing addUser (Duplicate Email)...");
    await userData.addUser(
      "john@example.com", 
      "Johnny",
      "Doe",
      "Password123!"
    );
    console.error("FAIL: Allowed duplicate email (Did you forget to 'await' emailInUse?).");
  } catch (e: any) {
    if (e.message.includes("in use")) {
      console.log("PASS: Correctly blocked duplicate email.");
    } else {
      console.error(`FAIL: Wrong error caught: ${e.message}`);
    }
  }

  // test getAllUsers
  try {
    console.log("3. Testing getAllUsers...");
    const userList = await userData.getAllUsers();

    // should be 1 if duplicate failed, or 2 if duplicate bug exists

    if (userList.length === 1) {
      console.log("PASS: Returned exactly 1 user.");
    } else {
      console.warn(`WARN: Expected 1 user, found ${userList.length}`);
    }
  } catch (e) {
    console.error(`FAIL: Error thrown: ${e}`);
  }

  // test getUserByID
  try {
    console.log("4. Testing getUserByID...");
    const user = await userData.getUserByID(firstUserId);
    if (user.first_name === "John") {
      console.log("PASS: User retrieved correctly.");
    } else {
      console.error("FAIL: User data mismatch.");
    }
  } catch (e) {
    console.error(`FAIL: Error thrown: ${e}`);
  }

  // test editUser
  try {
    console.log("5. Testing editUser...");

    const updated = await userData.editUser(
        "john@example.com", 
        "Jonathan", 
        null
    );

    if (updated.first_name === "Jonathan") {
        console.log("PASS: First name updated.");
    } else {
        console.error("FAIL: First name not updated.");
    }
  } catch (e) {
    console.error(`FAIL: Error thrown: ${e}`);
  }

  // test deleteUser
  try {
    console.log("6. Testing deleteUser...");
    await userData.deleteUser(firstUserId);
    
    // verify that the user is obliterated
    try {
        await userData.getUserByID(firstUserId);
        console.error("FAIL: User still exists after delete.");
    } catch(e) {
        console.log("PASS: User deleted and cannot be found.");
    }
  } catch (e) {
    console.error(`FAIL: Error thrown during delete: ${e}`);
  }

  console.log("--- User Tests Completed ---");
  await closeConnection();
}

main().catch((e) => {
  console.error("Unexpected error in test runner:", e);
});