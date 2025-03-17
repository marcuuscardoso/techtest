import "dotenv/config";
import { Dialect } from "sequelize";
import { SequelizeOptions } from "sequelize-typescript";
import { join } from "path";
import { isDevelopment } from "@/shared/utils/constants.util";
import { TechTest } from "@/shared/infra/http/app";

export const dbConfig: SequelizeOptions = {
    dialect: "mysql" as Dialect,
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
    ssl: !isDevelopment,
    logging: process.env.DEBUG ? (msg: string) => TechTest.instance.logger.debug(msg) : false,
    models: [join(__dirname, "../shared/infra/sequelize/models/*") + (process.env.NODE_ENV === "production" ? ".js" : ".ts")],
    retry: {
        max: 10,
        timeout: 3000
    }
};
