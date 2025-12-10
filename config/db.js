import pg from 'pg';

const { Pool } = pg;

export const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'proyecto',
    password: '12345',
    port: 5432,
});

pool.connect()
    .then(client => {
        console.log('PostgreSQL conectado exitosamente');
        client.release();
    })
    .catch(err => {
        console.error('Error conectando a PostgreSQL:', err.message);
    });