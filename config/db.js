require('dotenv').config();

// Check for Postgres connection strings or individual parameters
const postgresUrl = 
    process.env.POSTGRES_URL || 
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING || 
    process.env.DATABASE_URL || 
    process.env.SUPABASE_DATABASE_URL;

const isServerless = !!(process.env.NETLIFY || process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

// Initial Seed Data for in-memory fallback
const initialUsers = [
    { id: 1, first_name: 'Rahul', last_name: 'Sharma', email: 'rahul.s@example.com', phone: '+91 9876543210', city: 'Mumbai', state: 'Maharashtra', country: 'India', created_at: new Date(), updated_at: new Date() },
    { id: 2, first_name: 'Priya', last_name: 'Patel', email: 'priya.p@example.com', phone: '+91 9876543211', city: 'New Delhi', state: 'Delhi', country: 'India', created_at: new Date(), updated_at: new Date() },
    { id: 3, first_name: 'Amit', last_name: 'Singh', email: 'amit.s@example.com', phone: '+91 9876543212', city: 'Bangalore', state: 'Karnataka', country: 'India', created_at: new Date(), updated_at: new Date() },
    { id: 4, first_name: 'Neha', last_name: 'Gupta', email: 'neha.g@example.com', phone: '+91 9876543213', city: 'Chennai', state: 'Tamil Nadu', country: 'India', created_at: new Date(), updated_at: new Date() },
    { id: 5, first_name: 'Abhay', last_name: 'Kumar', email: 'abhaykumar4771@gmail.com', phone: '+91 9876543219', city: 'Ranchi', state: 'Jharkhand', country: 'India', created_at: new Date(), updated_at: new Date() },
    { id: 6, first_name: 'John', last_name: 'Doe', email: 'john.doe@example.com', phone: '+1 2125551234', city: 'New York City', state: 'New York', country: 'USA', created_at: new Date(), updated_at: new Date() },
    { id: 7, first_name: 'Jane', last_name: 'Smith', email: 'jane.smith@example.com', phone: '+1 4155551234', city: 'San Francisco', state: 'California', country: 'USA', created_at: new Date(), updated_at: new Date() },
    { id: 8, first_name: 'Emily', last_name: 'Brown', email: 'emily.b@example.com', phone: '+44 7911123456', city: 'London', state: 'England', country: 'UK', created_at: new Date(), updated_at: new Date() }
];

const initialNotifications = [
    { id: 1, user_id: 1, subject: 'Welcome to UserDash', message: 'Welcome to the User Management dashboard!', sent_at: new Date(), status: 'sent' },
    { id: 2, user_id: 5, subject: 'Account Verified', message: 'Your account is active and verified.', sent_at: new Date(), status: 'sent' }
];

// In-Memory Database Adapter for cloud serverless when no cloud DB is provided
function createInMemoryAdapter() {
    console.log('Using In-Memory Database Adapter (Demo Mode).');
    let users = JSON.parse(JSON.stringify(initialUsers));
    let notifications = JSON.parse(JSON.stringify(initialNotifications));
    let nextUserId = 9;
    let nextNotifId = 3;

    return {
        isMemory: true,
        query: async (sql, params = []) => {
            const trimmed = sql.trim();

            // 1. SELECT * FROM users WHERE id = ?
            if (/^SELECT\s+\*\s+FROM\s+users\s+WHERE\s+id\s*=\s*\?/i.test(trimmed)) {
                const user = users.find(u => String(u.id) === String(params[0]));
                return [[user || null].filter(Boolean), []];
            }

            // 2. Search users
            if (/WHERE.*LIKE/i.test(trimmed)) {
                const term = (params[0] || '').replace(/%/g, '').toLowerCase();
                const matched = users.filter(u =>
                    (u.first_name && u.first_name.toLowerCase().includes(term)) ||
                    (u.last_name && u.last_name.toLowerCase().includes(term)) ||
                    (u.email && u.email.toLowerCase().includes(term)) ||
                    (u.city && u.city.toLowerCase().includes(term)) ||
                    (u.state && u.state.toLowerCase().includes(term)) ||
                    (u.country && u.country.toLowerCase().includes(term)) ||
                    (u.phone && u.phone.includes(term))
                );
                return [matched, []];
            }

            // 3. SELECT * FROM users ORDER BY id ASC
            if (/^SELECT\s+\*\s+FROM\s+users/i.test(trimmed)) {
                return [[...users].sort((a, b) => a.id - b.id), []];
            }

            // 4. INSERT INTO users
            if (/^INSERT\s+INTO\s+users/i.test(trimmed)) {
                const [first_name, last_name, email, phone, city, state, country] = params;
                // Duplicate email check
                if (users.some(u => u.email.toLowerCase() === String(email).toLowerCase())) {
                    const dupErr = new Error("Duplicate entry '" + email + "' for key 'users.email'");
                    dupErr.code = 'ER_DUP_ENTRY';
                    dupErr.errno = 1062;
                    throw dupErr;
                }
                const newId = nextUserId++;
                const newUser = { id: newId, first_name, last_name, email, phone, city, state, country, created_at: new Date(), updated_at: new Date() };
                users.push(newUser);
                return [{ insertId: newId, affectedRows: 1 }, []];
            }

            // 5. UPDATE users
            if (/^UPDATE\s+users\s+SET/i.test(trimmed)) {
                const [first_name, last_name, email, phone, city, state, country, id] = params;
                const idx = users.findIndex(u => String(u.id) === String(id));
                if (idx !== -1) {
                    // Duplicate email check for other users
                    if (users.some(u => u.id !== users[idx].id && u.email.toLowerCase() === String(email).toLowerCase())) {
                        const dupErr = new Error("Duplicate entry '" + email + "' for key 'users.email'");
                        dupErr.code = 'ER_DUP_ENTRY';
                        dupErr.errno = 1062;
                        throw dupErr;
                    }
                    users[idx] = { ...users[idx], first_name, last_name, email, phone, city, state, country, updated_at: new Date() };
                    return [{ affectedRows: 1 }, []];
                }
                return [{ affectedRows: 0 }, []];
            }

            // 6. DELETE FROM users
            if (/^DELETE\s+FROM\s+users/i.test(trimmed)) {
                const id = params[0];
                const prevLen = users.length;
                users = users.filter(u => String(u.id) !== String(id));
                notifications = notifications.filter(n => String(n.user_id) !== String(id));
                return [{ affectedRows: prevLen - users.length }, []];
            }

            // 7. Group by city
            if (/SELECT\s+city,\s+COUNT/i.test(trimmed)) {
                const map = {};
                users.forEach(u => {
                    const k = u.city || 'Unknown';
                    map[k] = (map[k] || 0) + 1;
                });
                const res = Object.keys(map).map(k => ({ city: k, count: map[k] })).sort((a, b) => b.count - a.count);
                return [res, []];
            }

            // 8. Group by state
            if (/SELECT\s+state,\s+COUNT/i.test(trimmed)) {
                const map = {};
                users.forEach(u => {
                    const k = u.state || 'Unknown';
                    map[k] = (map[k] || 0) + 1;
                });
                const res = Object.keys(map).map(k => ({ state: k, count: map[k] })).sort((a, b) => b.count - a.count);
                return [res, []];
            }

            // 9. Group by country
            if (/SELECT\s+country,\s+COUNT/i.test(trimmed)) {
                const map = {};
                users.forEach(u => {
                    const k = u.country || 'Unknown';
                    map[k] = (map[k] || 0) + 1;
                });
                const res = Object.keys(map).map(k => ({ country: k, count: map[k] })).sort((a, b) => b.count - a.count);
                return [res, []];
            }

            // 10. Analytics counts
            if (/SELECT\s+COUNT\s*\(\s*\*\s*\)\s+as\s+count\s+FROM\s+users/i.test(trimmed)) {
                return [[{ count: users.length }], []];
            }
            if (/COUNT\s*\(\s*DISTINCT\s+city\s*\)/i.test(trimmed)) {
                const cities = new Set(users.map(u => u.city).filter(Boolean));
                return [[{ count: cities.size }], []];
            }
            if (/COUNT\s*\(\s*DISTINCT\s+state\s*\)/i.test(trimmed)) {
                const states = new Set(users.map(u => u.state).filter(Boolean));
                return [[{ count: states.size }], []];
            }
            if (/COUNT\s*\(\s*DISTINCT\s+country\s*\)/i.test(trimmed)) {
                const countries = new Set(users.map(u => u.country).filter(Boolean));
                return [[{ count: countries.size }], []];
            }

            // 11. INSERT INTO notifications
            if (/^INSERT\s+INTO\s+notifications/i.test(trimmed)) {
                const [user_id, subject, message, status] = params;
                const newId = nextNotifId++;
                notifications.unshift({ id: newId, user_id, subject, message, sent_at: new Date(), status: status || 'sent' });
                return [{ insertId: newId, affectedRows: 1 }, []];
            }

            // 12. SELECT notifications history
            if (/FROM\s+notifications/i.test(trimmed)) {
                const joined = notifications.slice(0, 50).map(n => {
                    const u = users.find(user => String(user.id) === String(n.user_id));
                    return {
                        id: n.id,
                        user_id: n.user_id,
                        subject: n.subject,
                        message: n.message,
                        sent_at: n.sent_at,
                        status: n.status || 'sent',
                        first_name: u ? u.first_name : 'User',
                        last_name: u ? u.last_name : `#${n.user_id}`,
                        email: u ? u.email : ''
                    };
                });
                return [joined, []];
            }

            return [[], []];
        },
        execute: async (sql, params = []) => {
            return dbAdapter.query(sql, params);
        },
        getConnection: async () => {
            return {
                release: () => {},
                query: async (sql, params) => dbAdapter.query(sql, params)
            };
        }
    };
}

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
            }
        } catch (initErr) {
            console.error('Error ensuring Supabase tables exist:', initErr.message);
        }
    };

    ensureTablesExist();

    const translateQuery = (sql, params = []) => {
        let pgSql = sql;
        pgSql = pgSql.replace(/DATE_SUB\s*\(\s*NOW\(\)\s*,\s*INTERVAL\s+30\s+DAY\s*\)/gi, "NOW() - INTERVAL '30 days'");

        if (/^\s*INSERT\s+INTO/i.test(pgSql) && !/RETURNING/i.test(pgSql)) {
            pgSql += ' RETURNING id';
        }

        let paramIndex = 1;
        pgSql = pgSql.replace(/\?/g, () => `$${paramIndex++}`);

        return { pgSql, params };
    };

    dbAdapter = {
        isPostgres: true,
        query: async (sql, params = []) => {
            const { pgSql, params: pgParams } = translateQuery(sql, params);
            const res = await pgPool.query(pgSql, pgParams);
            
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

} else if (isServerless) {
    // Cloud Serverless (Netlify / Vercel) without a DATABASE_URL configured yet
    console.log('Running on Cloud Serverless without DATABASE_URL. Using In-Memory database fallback.');
    dbAdapter = createInMemoryAdapter();

} else {
    // Local development MySQL
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
            console.warn('Local MySQL connection failed:', err.message);
            console.log('Activating In-Memory database fallback.');
            dbAdapter = createInMemoryAdapter();
        });
}

module.exports = dbAdapter;
