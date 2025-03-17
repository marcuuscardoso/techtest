import { Sequelize } from "sequelize-typescript";
import { dbConfig } from "@/config/sequelize";

export const sequelize = new Sequelize(dbConfig);