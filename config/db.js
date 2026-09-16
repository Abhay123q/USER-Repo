require('dotenv').config();

// Check for Postgres connection strings or individual parameters
const postgresUrl = 
    process.env.POSTGRES_URL || 
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING || 
    process.env.DATABASE_URL || 
    process.env.SUPABASE_DATABASE_URL;

let dbAdapter;

if (postgresUrl || process.env.POSTGRES_HOST) {
    console.log('Detected Cloud PostgreSQL / Supabase connection.');
    const { Pool } = require('pg');
    
    const poolConfig = postgresUrl 
        ? {
            connectionString: postgresUrl,
            ssl: { rejectUnauthorized: false }
          }
        : {
            host: process.env.POSTGRES_HOST,
            port: process.env.POSTGRES_PORT || 5432,
            user: process.env.POSTGRES_USER || 'postgres',
            password: process.env.POSTGRES_PASSWORD,
            database: process.env.POSTGRES_DATABASE || 'postgres',
            ssl: { rejectUnauthorized: false }
          };

    const pgPool = new Pool(poolConfig);

    // Auto-create tables in Supabase if they don't exist
    const ensureTablesExist = async () => {
        try {
            await pgPool.query(`
                CREATE TABLE IF NOT EXISTS users (
                  id SERIAL PRIMARY KEY,
                  first_name VARCHAR(50) NOT NULL,
                  last_name VARCHAR(50) NOT NULL,
                  email VARCHAR(100) NOT NULL UNIQUE,
                  phone VARCHAR(20),
                  city VARCHAR(50),
                  state VARCHAR(50),
                  country VARCHAR(50),
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS notifications (
                  id SERIAL PRIMARY KEY,
                  user_id INT NOT NULL,
                  subject VARCHAR(200) NOT NULL,
                  message TEXT NOT NULL,
                  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  status VARCHAR(20) DEFAULT 'sent',
                  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                );
            `);

            // Check if users table is empty; if so, seed initial users
            const check = await pgPool.query('SELECT COUNT(*) as count FROM users');
            if (parseInt(check.rows[0].count, 10) === 0) {
                await pgPool.query(`
                    INSERT INTO users (first_name, last_name, email, phone, city, state, country) VALUES
                    ('Rahul', 'Sharma', 'rahul.s@example.com', '+91 9876543210', 'Mumbai', 'Maharashtra', 'India'),
                    ('Priya', 'Patel', 'priya.p@example.com', '+91 9876543211', 'New Delhi', 'Delhi', 'India'),
                    ('Amit', 'Singh', 'amit.s@example.com', '+91 9876543212', 'Bangalore', 'Karnataka', 'India'),
                    ('Neha', 'Gupta', 'neha.g@example.com', '+91 9876543213', 'Chennai', 'Tamil Nadu', 'India'),
                    ('Abhay', 'Kumar', 'abhaykumar4771@gmail.com', '+91 9876543219', 'Ranchi', 'Jharkhand', 'India'),
                    ('John', 'Doe', 'john.doe@example.com', '+1 2125551234', 'New York City', 'New York', 'USA'),
                    ('Jane', 'Smith', 'jane.smith@example.com', '+1 4155551234', 'San Francisco', 'California', 'USA'),
                    ('Emily', 'Brown', 'emily.b@example.com', '+44 7911123456', 'London', 'England', 'UK');
                `);
                console.log('Seeded initial users in Supabase.');
            }
            console.log('Supabase tables verified and ready.');
        } catch (initErr) {
            console.error('Error ensuring Supabase tables exist:', initErr.message);
        }
    };

    ensureTablesExist();

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
