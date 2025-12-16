import { ObjectId } from "mongodb";
import { validateEmail, validateStrAsObjectId } from "../../../common/validation";
import { Token, tokens } from "../config/mongoCollections";
import { NotFoundError } from "../../../common/errors";

let exportedMethods = {
    async getTokenByID(id: string) {
        id = validateStrAsObjectId(id);
    
        const tokenCollection = await tokens();
        const token = await tokenCollection.findOne({ _id: new ObjectId(id) });
    
        if (!token) {
          throw new NotFoundError(`Could not find token with id: ${id}`);
        }
    
        return token;
    },

    async tokenExists(email: string, event_id: string) {
        email = validateEmail(email);
        event_id = validateStrAsObjectId(event_id);

        const tokenCollection = await tokens();
        const token = await tokenCollection.findOne({ email: email, event: new ObjectId(event_id) });
    
        if (!token) {
            return false;
        }
    
        return true;
    },

    async createToken(email: string, event_id: string): Promise<Token> {
        email = validateEmail(email);
        event_id = validateStrAsObjectId(event_id);

        const token = {
            _id: new ObjectId(),
            email,
            event: new ObjectId(event_id)
        }

        const tokenCollection = await tokens();
        const t = await tokenCollection.insertOne(token);

        if (!t) {
            throw new NotFoundError(`Could not create token ${token}`)
        }

        return token;
    }
};

export default exportedMethods;
