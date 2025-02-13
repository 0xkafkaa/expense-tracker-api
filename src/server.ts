import express from "express";
import "dotenv/config";
import authRoutes from "./routes/authRoutes";
const app = express();
app.use(express.json());

app.use("/auth", authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("listening on port 3000"));
