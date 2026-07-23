import "server-only";
import mongoose, { type Mongoose } from "mongoose";
import { env } from "@/lib/env";

/**
 * Serverless-safe Mongoose connection.
 *
 * Next.js reloads modules on every request in development and may spin up many
 * lambda instances in production, so the connection promise is cached on the
 * global object rather than in module scope.
 */

interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

const globalForMongoose = globalThis as typeof globalThis & {
  __pixscribeMongoose?: MongooseCache;
};

const cache: MongooseCache = (globalForMongoose.__pixscribeMongoose ??= {
  conn: null,
  promise: null,
});

export async function connectToDatabase(): Promise<Mongoose> {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(env.mongodbUri, {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10_000,
      })
      .catch((error) => {
        // Clear the cached promise so the next request can retry instead of
        // permanently resolving to a rejected connection.
        cache.promise = null;
        throw error;
      });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
