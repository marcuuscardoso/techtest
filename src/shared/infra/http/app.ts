import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./api/routes";
import winston from "winston";
import { errorHandler } from "@/shared/errors/error.handler";
import { sequelize } from "../sequelize"; 
import { createNamedLogger } from "../logger";

export const App: TechTest = null as any;

export class TechTest {
    public static instance: TechTest;
    public server: express.Application;
    public sequelize: typeof sequelize;
    public logger: winston.Logger;

    constructor() {
        TechTest.instance = this;
        this.server = express();
        this.sequelize = sequelize;
        this.middlewares();
        this.routes();
        this.databases();
        this.errorHandler();

        this.logger = createNamedLogger("app", {
            fileName: "app"
        });
    }

    private middlewares() {
        this.server.use(express.json({ limit: "50mb" }));
        this.server.use(express.urlencoded({ extended: false }));
        this.server.use(cookieParser());
        this.server.set("trust proxy", true);

        this.server.use(
            cors({
                credentials: true,
                origin: (origin, callback) => {
                    if (!origin || [process.env.FRONTEND_URL].includes(origin)) {
                        callback(null, true);
                    } else {
                        this.logger.info(`Origin not allowed by CORS: ${origin}`);
                        callback(new Error("Not allowed by CORS"));
                    }
                }
            })
        );
    }

    private routes() {
        this.server.use("/api", routes);
    }

    private errorHandler() {
        this.server.use(errorHandler);
    }

    private databases() {
        try {
            this.sequelize.authenticate()
                .then(() => this.logger.info("Connection has been established successfully."))
                .catch(err => this.logger.error("Unable to connect to the Database:", err));
        } catch (err) {
            this.logger.error("Unable to connect to the Database:", err);
        }
    }
}

export default new TechTest().server;
