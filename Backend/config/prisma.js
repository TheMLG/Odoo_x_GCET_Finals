import { PrismaMssql } from "@prisma/adapter-mssql";
import "dotenv/config";
import { PrismaClient } from "../generated/prisma/index.js";

const connectionString = process.env.DATABASE_URL;

const adapter = new PrismaMssql({ connectionString });
const prisma = new PrismaClient({ adapter });

export default prisma;
