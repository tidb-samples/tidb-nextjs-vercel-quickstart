import { NextResponse } from 'next/server';

import { DataService } from '../hello/route';

class CRUDDataService extends DataService {
  async createTable() {
    const sql = `CREATE TABLE IF NOT EXISTS players (
      id INT(11) NOT NULL AUTO_INCREMENT COMMENT 'The unique ID of the player.',
      coins INT(11) COMMENT 'The number of coins that the player had.',
      goods INT(11) COMMENT 'The number of goods that the player had.',
      PRIMARY KEY (\`id\`)
  )`;
    await this.singleQuery(sql);
  }

  /**
   * Player.
   * @typedef {Object} Player
   * @property {number} id Player ID.
   * @property {number} coins Coins.
   * @property {number} goods Goods.
   */

  async insert() {
    const sql = `INSERT INTO
    players (\`id\`, \`coins\`, \`goods\`)
    VALUES
        (1, 1, 1024),
        (2, 2, 512),
        (3, 3, 256),
        (4, 4, 128),
        (5, 5, 64),
        (6, 6, 32),
        (7, 7, 16),
        (8, 8, 8),
        (9, 9, 4),
        (10, 10, 2),
        (11, 11, 1);`;
    const { results } = await this.singleQuery(sql);
    return results;
  }

  async getTiDBVersion() {
    const { results } = await this.singleQuery(
      'SELECT VERSION() AS tidb_version;'
    );
    return results;
  }

  /**
   * CREATE a new player.
   * @param {number} coins initial coins
   * @param {number} goods initial goods
   * @returns {Promise<number>}
   */
  async createPlayer(coins, goods) {
    const results = await this.singleQuery(
      `INSERT INTO players (coins, goods) VALUES (?, ?);`,
      [coins, goods]
    );
    return results;
  }

  /**
   * READ player information by ID.
   * @param {number} id The ID of the player to get.
   * @returns {Promise<Player>}
   */
  async getPlayerByID(id) {
    const results = await this.singleQuery(
      'SELECT id, coins, goods FROM players WHERE id = ?;',
      [id]
    );
    return results;
  }

  /**
   * UPDATE player.
   * @param {number} playerID The ID of the player to update.
   * @param {number} incCoins The increased coins.
   * @param {number} incGoods The increased goods.
   * @returns {*} The number of affected rows, return 1 if updated successfully.
   */
  async updatePlayer(playerID, incCoins, incGoods) {
    const results = await this.singleQuery(
      'UPDATE players SET coins = coins + ?, goods = goods + ? WHERE id = ?;',
      [incCoins, incGoods, playerID]
    );
    return results;
  }

  /**
   * DELETE player by ID.
   * @param {number} id The ID of the player to delete.
   * @returns {*} The number of affected rows, return 1 if updated successfully.
   */
  async deletePlayerByID(id) {
    const results = await this.singleQuery(
      'DELETE FROM players WHERE id = ?;',
      [id]
    );
    return results;
  }
}

export async function GET(request) {
  const crudDataService = new CRUDDataService();

  const { searchParams } = new URL(request.url);
  const isInit = searchParams.get('init');
  const playerId = searchParams.get('id');

  try {
    // Create table and insert data.
    if (isInit) {
      await crudDataService.createTable();
      const results = await crudDataService.insert();
      return NextResponse.json({ results });
    }
    // Get player by ID.
    if (playerId) {
      const results = await crudDataService.getPlayerByID(playerId);
      return NextResponse.json({ results });
    }
    // Get TiDB version.
    const results = await crudDataService.getTiDBVersion();
    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.error(error);
  }
}

export async function POST(request) {
  const { coins, goods } = await request.json();

  if (!coins || !goods) {
    return NextResponse.error('coins and goods are required');
  }

  const crudDataService = new CRUDDataService();

  try {
    const results = await crudDataService.createPlayer(coins, goods);
    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.error(error);
  }
}

export async function PUT(request) {
  const { id, coins, goods } = await request.json();

  if (!id || !coins || !goods) {
    return NextResponse.error('id, coins and goods are required');
  }

  const crudDataService = new CRUDDataService();

  try {
    const results = await crudDataService.updatePlayer(id, coins, goods);
    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.error(error);
  }
}

export async function DELETE(request) {
  const { id } = await request.json();

  if (!id) {
    return NextResponse.error('id is required');
  }

  const crudDataService = new CRUDDataService();

  try {
    const results = await crudDataService.deletePlayerByID(id);
    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.error(error);
  }
}
