import { MongoClient, Db, ObjectId, Collection, Filter, UpdateFilter } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || '';
const DB_NAME = process.env.MONGODB_DB_NAME || 'cloud_expense_companion';

let client: MongoClient | null = null;
let db: Db | null = null;
let lastConnectionError: string | null = null;
let connecting: Promise<void> | null = null;

export function toMongoId(id: string | any): any {
  if (!id) return id;
  if (typeof id === 'string' && ObjectId.isValid(id) && id.length === 24) {
    return new ObjectId(id);
  }
  return id;
}

function normalizeQuery(query: Record<string, any> = {}): Record<string, any> {
  const normalized: Record<string, any> = { ...query };
  if (typeof normalized._id === 'string') normalized._id = toMongoId(normalized._id);
  if (typeof normalized.id === 'string') {
    normalized._id = toMongoId(normalized.id);
    delete normalized.id;
  }
  return normalized;
}

function getDb(): Db {
  if (!db) {
    throw new Error('MongoDB Atlas is not connected. Check MONGODB_URI, Atlas Network Access, and database credentials.');
  }
  return db;
}

class AtlasCollection {
  constructor(public readonly collectionName: string) {}

  private raw(): Collection {
    return getDb().collection(this.collectionName);
  }

  async find(query: Record<string, any> = {}): Promise<any[]> {
    const docs = await this.raw().find(normalizeQuery(query)).toArray();
    return docs.map((doc: any) => ({
      ...doc,
      _id: String(doc._id),
      id: String(doc._id),
    }));
  }

  async findOne(query: Record<string, any>): Promise<any | null> {
    const doc: any = await this.raw().findOne(normalizeQuery(query));
    return doc ? { ...doc, _id: String(doc._id), id: String(doc._id) } : null;
  }

  async insertOne(doc: any): Promise<{ insertedId: string; acknowledged: boolean }> {
    const payload = { ...doc };
    delete payload.id;
    if (typeof payload._id === 'string') payload._id = toMongoId(payload._id);
    const result = await this.raw().insertOne(payload);
    return { insertedId: String(result.insertedId), acknowledged: result.acknowledged };
  }

  async updateOne(query: Record<string, any>, update: any): Promise<{ modifiedCount: number; matchedCount: number }> {
    const safeUpdate = update?.$set ? update : { $set: update };
    const result = await this.raw().updateOne(
      normalizeQuery(query) as Filter<any>,
      safeUpdate as UpdateFilter<any>
    );
    return { modifiedCount: result.modifiedCount, matchedCount: result.matchedCount };
  }

  async deleteOne(query: Record<string, any>): Promise<{ deletedCount: number }> {
    const result = await this.raw().deleteOne(normalizeQuery(query));
    return { deletedCount: result.deletedCount || 0 };
  }

  async countDocuments(query: Record<string, any> = {}): Promise<number> {
    return this.raw().countDocuments(normalizeQuery(query));
  }
}

const collectionCache = new Map<string, AtlasCollection>();

export function getMongoCollection(name: string): AtlasCollection {
  if (!collectionCache.has(name)) collectionCache.set(name, new AtlasCollection(name));
  return collectionCache.get(name)!;
}

/**
 * Atlas is the only persistence provider. Startup fails if Atlas cannot be reached;
 * the app never silently writes financial data to local JSON files.
 */
export async function initMongoDB(): Promise<void> {
  if (db) return;
  if (connecting) return connecting;
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is missing. Add your MongoDB Atlas connection string to the server .env file.');
  }

  connecting = (async () => {
    const nextClient = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      retryWrites: true,
    });

    try {
      await nextClient.connect();
      const nextDb = nextClient.db(DB_NAME);
      await nextDb.command({ ping: 1 });

      // Indexes support per-user lookups and avoid duplicate accounts/budgets.
      await Promise.all([
      // Existing email_1 index is already present in Atlas.
      nextDb.collection('users').createIndex(
        { email: 1 },
        { unique: true, name: 'email_1' }
      ),

      nextDb.collection('expenses').createIndex({
        userId: 1,
        date: -1,
      }),

      nextDb.collection('incomes').createIndex({
        userId: 1,
        date: -1,
      }),

      nextDb.collection('budgets').createIndex(
        { userId: 1, category: 1 },
        { unique: true }
      ),

      nextDb.collection('savings_goals').createIndex({
        userId: 1,
        createdAt: -1,
      }),
    ]);

      client = nextClient;
      db = nextDb;
      lastConnectionError = null;
      console.log(`[MongoDB Atlas] Connected. Database: ${DB_NAME}`);
    } catch (error: any) {
      lastConnectionError = error?.message || String(error);
      await nextClient.close().catch(() => undefined);
      throw new Error(`MongoDB Atlas connection failed: ${lastConnectionError}`);
    }
  })();

  try {
    await connecting;
  } finally {
    connecting = null;
  }
}

// Kept for compatibility with existing server.ts imports. Do not accept browser-supplied URIs.
export async function connectToAtlas(_uri: string, _customDbName?: string) {
  return {
    success: false,
    error: 'Atlas credentials must be configured only in the server .env file, not submitted by the browser.',
  };
}

// Existing app calls this after an empty query. Keep it as a no-op: users start with empty personal records.
export async function seedUserDataIfEmpty(_userId: string): Promise<void> {
  return;
}

export async function getMongoStatus() {
  const connected = Boolean(db);
  const names = ['users', 'expenses', 'incomes', 'budgets', 'savings_goals'];
  const collections: Record<string, number | null> = {};

  if (connected) {
    for (const name of names) {
      try {
        collections[name] = await getMongoCollection(name).countDocuments({});
      } catch {
        collections[name] = null;
      }
    }
  } else {
    for (const name of names) collections[name] = null;
  }

  return {
    database: DB_NAME,
    type: 'MongoDB Atlas',
    connected,
    isAtlasLive: connected,
    connectionString: MONGODB_URI
      ? MONGODB_URI.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:****@')
      : 'Not configured',
    lastError: lastConnectionError,
    collections,
    schemas: {
      users: { _id: 'ObjectId', uid: 'String', email: 'String', passwordHash: 'String', displayName: 'String', role: 'String', createdAt: 'Date' },
      expenses: { _id: 'ObjectId', userId: 'String', title: 'String', amount: 'Number', category: 'String', date: 'String', description: 'String', createdAt: 'Date' },
      incomes: { _id: 'ObjectId', userId: 'String', source: 'String', amount: 'Number', category: 'String', date: 'String', description: 'String', createdAt: 'Date' },
      budgets: { _id: 'ObjectId', userId: 'String', category: 'String', monthlyLimit: 'Number' },
      savings_goals: { _id: 'ObjectId', userId: 'String', name: 'String', targetAmount: 'Number', currentAmount: 'Number', deadline: 'String', description: 'String', createdAt: 'Date', updatedAt: 'Date' },
    },
  };
}

export async function closeMongoDB(): Promise<void> {
  if (client) await client.close();
  client = null;
  db = null;
}
