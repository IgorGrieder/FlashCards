import DB from "../database/config.js"

/**
 * @returns {import('mongodb').Collection}
 */
export const DBCollections = () => DB.getDB("collections");

/**
 * @returns {import('mongodb').Collection}
 */
export const DBUsers = () => DB.getDB("users");
