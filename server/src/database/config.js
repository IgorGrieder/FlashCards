import { MongoClient } from 'mongodb';

let db;
let client;

async function connectDB() {
  try {
    const uri = process.env.DB_STRING;
    client = new MongoClient(uri);

    await client.connect();
    db = client.db(process.env.DB_NAME);

    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  }
}

function getDB(col) {
  if (!db) {
    throw new Error('Database not connected. Call connectDB() first.');
  }
  return db.collection(col);
}

async function closeDB() {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

export default { connectDB, getDB, closeDB };

