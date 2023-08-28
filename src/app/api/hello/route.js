import { NextResponse } from 'next/server';
import { getConnection } from '../../../lib/tidb';

export class DataService {
  constructor() {
    this.pool = getConnection();
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
  }
}
