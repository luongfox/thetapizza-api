import { MongoClient } from 'mongodb';

export const StakeDao = class {

    constructor(dbClient) {
        this.dbClient = dbClient;
    }

    async save(stake) {
        
    }
}