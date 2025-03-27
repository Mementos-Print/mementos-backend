import pkg from 'pg';
import { config } from './env.js';
const { Pool } = pkg;

const connection =  new Pool({

    port: config.db.port,
    user: config.db.user,
    host: config.db.host,
    database: config.db.name,
    password: config.db.pass

});

// const getConnection = () => {
//     return Pool({
//         connectionString: config.dburl,
//         ssl: {
//             rejectUnauthorized: false
//         }
//     })
// };

// export const executeQuery = (query, values) => {
//     return new Promise((resolve, reject) => {
//         getConnection.query(query, values, (error, results) => {
//             if(error) {
//                 console.error(error);
//                 return reject(error);
//             }
//             return resolve(results);
//         })
//     }) 
// };

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