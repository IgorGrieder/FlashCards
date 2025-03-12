import DB from "../database/config.js"

export const DBCollections = () => DB.getDB("collections");
export const DBUsers = () => DB.getDB("users");
