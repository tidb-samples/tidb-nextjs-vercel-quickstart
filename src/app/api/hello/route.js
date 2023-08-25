import { NextResponse } from 'next/server';
import mysql from 'mysql2';

export class DataService {
  constructor(
    host = process.env.TIDB_HOST,
    port = process.env.TIDB_PORT,
    user = process.env.TIDB_USER,
    password = process.env.TIDB_PASSWORD,
    database = process.env.TIDB_DB_NAME || 'test'
  ) {
    const pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true,
      },
      waitForConnections: true,
      connectionLimit: 1,
      maxIdle: 1, // max idle connections, the default value is the same as `connectionLimit`
      idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
    this.pool = pool;
  }

  singleQuery(sql, ...args) {
    return new Promise((resolve, reject) => {
      this.pool.query(sql, ...args, (err, results, fields) => {
        if (err) {
          reject(err);
        } else {
          resolve({ results, fields });
        }
      });
    });
  }

  async close() {
    return new Promise((resolve, reject) => {
      this.pool.end((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

export async function GET(request) {
  const dataService = new DataService();

  try {
    const { results } = await dataService.singleQuery('SELECT "Hello World";');
    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.error(error);
  } finally {
    await dataService.close();
  }
}
