import { userData } from "../data/index.ts";

try { 
    const user1 = await userData.addUser("bennettwoods2004@gmail.com", "Ben", "Jamin", "lolololol");
    console.log("user added!");
    console.log(user1);
} catch (e) {
    console.log(`addUser failed with: ${e}`)
}


// this should fail
try {
    const user1 = await userData.addUser("bennettwoods2004@gmail.com", "FAKE", "GAY", "pasjdajsda1-923i0");
    console.log("\n\n\nuser added!");
    console.log(user1);
} catch (e) {
    console.log(`addUser failed with: ${e}`)
}