require("dotenv").config();

const dbConfig = {
    dialect: "mysql",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_DATABASE,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    timezone: "-03:00",
    pool: {
        max: 10,
        min: 0,
        idle: 10000
    },
    logging: process.env.DEBUG ? console.log : false
};

module.exports = dbConfig;