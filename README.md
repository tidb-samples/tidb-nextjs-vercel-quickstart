# TiDB Serverless Next.js Vercel Quickstart

Self-hosted or Vercel-hosted Next.js app that connects to a TiDB Serverless cluster.

- Framework: [Next.js](https://nextjs.org/)
- Driver: [MySQL2](https://github.com/sidorares/node-mysql2)
- Deployment(optional): [Vercel](https://vercel.com/)

If you want to know how to qucikly build a Next.js app that connects to a TiDB Serverless cluster, you can follow the [steps - Hello World](#Steps---Hello-World) below.

If you want to know how to qucikly build a Next.js app that connects to a TiDB Serverless cluster and implements CRUD(Create, Read, Update, Delete) operations, you can follow the [steps - CRUD](#Steps---CRUD) below.

## Prerequisites

- [TiDB Serverless cluster](https://www.pingcap.com/tidb-serverless/)
- [Node.js](https://nodejs.org/en/) >= 18.0.0
- [Yarn](https://yarnpkg.com/) >= 1.22.0

## Steps - Hello World

### 1. Clone this repo

```bash
git clone git@github.com:tidb-samples/tidb-nextjs-vercel-quickstart.git
```

### 2. Define Route Handler

> Route Handlers allow you to create custom request handlers for a given route using the Web Request and Response APIs. (https://nextjs.org/docs/app/building-your-application/routing/router-handlers)

Example Route: `/api/hello`

Example File: [`src/app/api/hello/route.js`](src/app/api/hello/route.js)

### 3. Configure Database Connection

Refer to [`src/lib/tidb.js`](src/lib/tidb.js)

```javascript
import mysql from 'mysql2';

let pool = null;

export function connect() {
  pool = mysql.createPool({
    host: process.env.TIDB_HOST, // TiDB host, for example: {gateway-region}.aws.tidbcloud.com
    port: process.env.TIDB_PORT || 4000, // TiDB port, default: 4000
    user: process.env.TIDB_USER, // TiDB user, for example: {prefix}.root
    password: process.env.TIDB_PASSWORD, // TiDB password
    database: process.env.TIDB_DATABASE || 'test', // TiDB database name, default: test
    ssl: {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: true,
    },
    connectionLimit: 1, // Setting connectionLimit to "1" in a serverless function environment optimizes resource usage, reduces costs, ensures connection stability, and enables seamless scalability.
    maxIdle: 1, // max idle connections, the default value is the same as `connectionLimit`
    enableKeepAlive: true,
  });
}

export function getConnection() {
  if (!pool) {
    pool = createPool();
  }
  return pool;
}
```

### 4. Configure Environment Variables

_Ignore this step if you are using Vercel-hosted deployment._

You need to configure the following environment variables:

```bash
TIDB_HOST="your_tidb_serverless_cluster_endpoint"
TIDB_PORT=4000
TIDB_USER="your_tidb_serverless_cluster_user"
TIDB_PASSWORD="your_tidb_serverless_cluster_password"
```

### 5. Define Database Query

Refer to [`src/app/api/hello/route.js#L9`](src/app/api/hello/route.js#L9)

```javascript
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
```

### 6. Define Route Handler

Refer to [`src/app/api/hello/route.js#L34`](src/app/api/hello/route.js#L34)

```javascript
import { NextResponse } from 'next/server';

export async function GET(request) {
  const dataService = new DataService();

  try {
    const { results } = await dataService.singleQuery('SELECT "Hello World";');
    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.error(error);
  }
}
```

Now you can test the route handler locally:

```bash
# Install dependencies
yarn
# start the app
yarn dev

# test the route handler
curl http://localhost:3000/api/hello
```

## Steps - CRUD

Follow the [steps 1: Clone this repo](#1-Clone-this-repo), [steps 2: Define Route Handler](#2-Define-Route-Handler) and [steps 3: Configure Database Connection](#3-Configure-Database-Connection) above to clone this repo, define route handler and configure database connection.

### 1. Init Database

Refer to [`src/app/api/crud/route.js#L6`](src/app/api/crud/route.js#L6)

```javascript
  async init() {
    await this.singleQuery(`
      CREATE TABLE IF NOT EXISTS \`todos\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`title\` varchar(255) NOT NULL,
        \`completed\` tinyint(1) NOT NULL DEFAULT '0',
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }
```

### 2. Create

Refer to [`src/app/api/crud/route.js#L56`](src/app/api/crud/route.js#L56)

```javascript
  async createPlayer(coins, goods) {
    const results = await this.singleQuery(
      `INSERT INTO players (coins, goods) VALUES (?, ?);`,
      [coins, goods]
    );
    return results;
  }
```

Handler: [`src/app/api/crud/route.js#L133`](src/app/api/crud/route.js#L133)

```javascript
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
  } finally {
    await crudDataService.close();
  }
}
```

### 3. Read

Refer to [`src/app/api/crud/route.js#L69`](src/app/api/crud/route.js#L69)

```javascript
  async getPlayerByID(id) {
    const results = await this.singleQuery(
      'SELECT id, coins, goods FROM players WHERE id = ?;',
      [id]
    );
    return results;
  }
```

Handler: [`src/app/api/crud/route.js#L106`](src/app/api/crud/route.js#L106)

```javascript
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
  } finally {
    await crudDataService.close();
  }
}
```

### 4. Update

Refer to [`src/app/api/crud/route.js#L84`](src/app/api/crud/route.js#L84)

```javascript
  async updatePlayer(playerID, incCoins, incGoods) {
    const results = await this.singleQuery(
      'UPDATE players SET coins = coins + ?, goods = goods + ? WHERE id = ?;',
      [incCoins, incGoods, playerID]
    );
    return results;
  }
```

Handler: [`src/app/api/crud/route.js#L150`](src/app/api/crud/route.js#L150)

```javascript
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
  } finally {
    await crudDataService.close();
  }
}
```

### 5. Delete

Refer to [`src/app/api/crud/route.js#L97`](src/app/api/crud/route.js#L97)

```javascript
  async deletePlayerByID(id) {
    const results = await this.singleQuery(
      'DELETE FROM players WHERE id = ?;',
      [id]
    );
    return results;
  }
```

Handler: [`src/app/api/crud/route.js#L167`](src/app/api/crud/route.js#L167)

```javascript
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
  } finally {
    await crudDataService.close();
  }
}
```

### 6. Test

Now you can test the route handler locally:

```bash
cd tidb-nextjs-vercel-quickstart
# Install dependencies
yarn
# start the app
yarn dev
```

#### 6.1 Create Table and Insert Data

```bash
curl http://localhost:3000/api/crud?init=true
```

#### 6.2 Get TiDB Version

```bash
curl http://localhost:3000/api/crud
```

#### 6.3 Create Player

```bash
curl -X POST -H "Content-Type: application/json" -d '{"coins":100,"goods":100}' http://localhost:3000/api/crud
```

#### 6.4 Get Player by ID

```bash
curl http://localhost:3000/api/crud?id=1
```

#### 6.5 Update Player

```bash
curl -X PUT -H "Content-Type: application/json" -d '{"id":1,"coins":100,"goods":100}' http://localhost:3000/api/crud
```

#### 6.6 Delete Player by ID

```bash
curl -X DELETE -H "Content-Type: application/json" -d '{"id":1}' http://localhost:3000/api/crud
```

## Vercel-hosted Deployment(Optional)

1. Visit [Vercel](https://vercel.com/) and sign up for an account.
2. Go to Dashboard and click `New Project`.
3. Select `Import Git Repository` and import this repo.
4. Click `Deploy` and wait for the deployment to finish.
5. Visit [Vercel `TiDB Cloud` integration](https://vercel.com/integrations/tidb-cloud) page, and click `Add Integration`.

After you have configured the integration, all the environment variables will be automatically set.
