import dotenv from "dotenv";
import express from "express";
import prisma from "./config/prisma.js";
import productRoutes from "./routes/product.routes.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/products", productRoutes);

app.get("/", async (req, res) => {
  res.send(await prisma.user.findMany());
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
