import express from "express";
import dotenv from "dotenv";
import authRoute from "./routes/auth.routes.js"
import { connectDB } from "./db/db.js";
const app = express();
dotenv.config();

app.use(express.json());
app.use("/api/v1/auth", authRoute);


app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
  connectDB();
});
