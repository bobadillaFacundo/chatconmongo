// db.js
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const { MONGO_URL, MONGO_DB, MONGO_COLLECTION } = process.env;

const client = new MongoClient(MONGO_URL, { useUnifiedTopology: true });
let collection;

/**
 * Inicializa la conexión a MongoDB y guarda la colección.
 */
export async function initDB() {
  await client.connect();
  const db = client.db(MONGO_DB);
  collection = db.collection(MONGO_COLLECTION);
  console.log('✅ MongoDB conectado');
}

/**
 * Devuelve la colección de mensajes.
 */
export function getMessageCollection() {
  if (!collection) {
    throw new Error('La colección no está inicializada. Llama primero a initDB().');
  }
  return collection;
}
