import { MongoClient } from 'mongodb';

let db;

async function connectDB() {
  try {
    const uri = process.env.DB_STRING;
    const client = new MongoClient(uri);

    await client.connect();
    db = client.db(process.env.DB_NAME);

    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1); // Stop the app if the DB connection fails
  }
}

function getDB(col) {
  if (!db) {
    throw new Error('Database not connected. Call connectDB() first.');
  }
  return db.collection(col);
}

export default { connectDB, getDB }
