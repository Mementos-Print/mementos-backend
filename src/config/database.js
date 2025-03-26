import pkg from 'pg';
import { config } from './env.js';
import { error } from 'console';
const { Pool } = pkg;

const connection =  new Pool({

    port: config.db.port,
    user: config.db.user,
    host: config.db.host,
    database: config.db.name,
    password: config.db.pass

});

export const executeQuery = (query, values) => {
    return new Promise((resolve, reject) => {
        connection.query(query, values, (error, results) => {
            if(error) {
                console.error(error);
                return reject(error);
            }
            return resolve(results);
        })
    }) 
};