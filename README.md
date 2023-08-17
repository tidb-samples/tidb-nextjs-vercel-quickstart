# TiDB Serverless Next.js Vercel Quickstart

Self-hosted or Vercel-hosted Next.js app that connects to a TiDB Serverless cluster.

- Framework: [Next.js](https://nextjs.org/)
- Driver: [MySQL2](https://github.com/sidorares/node-mysql2)
- Deployment(optional): [Vercel](https://vercel.com/)

## Prerequisites

- [TiDB Serverless cluster](https://www.pingcap.com/tidb-serverless/)
- [Node.js](https://nodejs.org/en/) >= 18.0.0
- [Yarn](https://yarnpkg.com/) >= 1.22.0

## Steps

### 1. Clone this repo

```bash
git clone git@github.com:tidb-samples/tidb-nextjs-vercel-quickstart.git
```

### 2. Define Route Handler

> Route Handlers allow you to create custom request handlers for a given route using the Web Request and Response APIs. (https://nextjs.org/docs/app/building-your-application/routing/router-handlers)

Example Route: `/api/hello`

Example File: [`src/app/api/hello/route.js`](src/app/api/hello/route.js)

### 3. Configure Database Connection

Refer to [`src/app/api/hello/route.js#L4`](src/app/api/hello/route.js#L4)

```javascript
import mysql from 'mysql2';

const pool = mysql.createPool({
  host, // TiDB Serverless cluster endpoint
  port, // TiDB Serverless cluster port, 4000 is the default
  user, // TiDB Serverless cluster user
  password, // TiDB Serverless cluster password
  database, // TiDB Serverless cluster database, 'test' is the default
  ssl: {  // TiDB Serverless cluster SSL config(required)
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true,
  },
  ... // other mysql2 config
});
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

Refer to [`src/app/api/hello/route.js#L33`](src/app/api/hello/route.js#L33)

```javascript
  singleQuery(sql) {
    return new Promise((resolve, reject) => {
      this.pool.query(sql, (err, results, fields) => {
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

Refer to [`src/app/api/hello/route.js#L58`](src/app/api/hello/route.js#L58)

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

## Vercel-hosted Deployment(Optional)

1. Visit [Vercel](https://vercel.com/) and sign up for an account.
2. Go to Dashboard and click `New Project`.
3. Select `Import Git Repository` and import this repo.
4. Click `Deploy` and wait for the deployment to finish.
5. Visit [Vercel `TiDB Cloud` integration](https://vercel.com/integrations/tidb-cloud) page, and click `Add Integration`.

After you have configured the integration, all the environment variables will be automatically set.
