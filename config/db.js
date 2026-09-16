require('dotenv').config();

// Check for Postgres connection strings (automatically supplied by Supabase / Vercel integration)
const postgresUrl = 
    process.env.POSTGRES_URL || 
    process.env.POSTGRES_URL_NON_POOLING || 
    process.env.DATABASE_URL || 
    process.env.SUPABASE_DATABASE_URL;

let dbAdapter;

if (postgresUrl) {
    console.log('Detected Cloud PostgreSQL / Supabase connection.');
    const { Pool } = require('pg');
    
    // Create PG pool with SSL support for cloud (Supabase)
    const pgPool = new Pool({
        connectionString: postgresUrl,
        ssl: {
            rejectUnauthorized: false
        }
    });

    // Helper to translate MySQL queries/syntax to PostgreSQL
    const translateQuery = (sql, params = []) => {
        let pgSql = sql;

        // Replace DATE_SUB(NOW(), INTERVAL 30 DAY) with PostgreSQL syntax
        pgSql = pgSql.replace(/DATE_SUB\s*\(\s*NOW\(\)\s*,\s*INTERVAL\s+30\s+DAY\s*\)/gi, "NOW() - INTERVAL '30 days'");

        // For INSERT without RETURNING, append RETURNING id to get insertId
        if (/^\s*INSERT\s+INTO/i.test(pgSql) && !/RETURNING/i.test(pgSql)) {
            pgSql += ' RETURNING id';
        }

        // Convert ? placeholders to $1, $2, $3...
        let paramIndex = 1;
        pgSql = pgSql.replace(/\?/g, () => `$${paramIndex++}`);

        return { pgSql, params };
    };

    dbAdapter = {
        isPostgres: true,
        query: async (sql, params = []) => {
            const { pgSql, params: pgParams } = translateQuery(sql, params);
            const res = await pgPool.query(pgSql, pgParams);
            
            // Format result like mysql2: [rows, fields] or [resultHeader]
            if (/^\s*INSERT\s+INTO/i.test(sql)) {
                const insertId = res.rows && res.rows[0] ? res.rows[0].id : null;
                return [{ insertId, affectedRows: res.rowCount }, res.fields];
            } else if (/^\s*(UPDATE|DELETE)\s+/i.test(sql)) {
                return [{ affectedRows: res.rowCount }, res.fields];
            } else {
                return [res.rows, res.fields];
            }
        },
        execute: async (sql, params = []) => {
            return dbAdapter.query(sql, params);
        },
        getConnection: async () => {
            const client = await pgPool.connect();
            return {
                release: () => client.release(),
                query: client.query.bind(client)
            };
        }
    };

    // Test connection
    pgPool.query('SELECT NOW()')
        .then(() => console.log('Successfully connected to Cloud PostgreSQL (Supabase).'))
        .catch(err => console.error('Cloud PostgreSQL connection error:', err.message));

} else {
    // Local MySQL fallback
    console.log('Using MySQL database (Local / Environment).');
    const mysql = require('mysql2/promise');

    const mysqlPool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'Abhay@123',
        database: process.env.DB_NAME || 'user_management_db',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    dbAdapter = mysqlPool;

    mysqlPool.getConnection()
        .then(conn => {
            console.log('Successfully connected to MySQL database.');
            conn.release();
        })
        .catch(err => {
            console.error('MySQL database connection failed:', err.message);
        });
}

module.exports = dbAdapter;
