import express from "express";
import "dotenv/config";
import authRoutes from "./routes/authRoutes";
import expenseRoutes from "./routes/expenseRoutes";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json());
// app.use(cors());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(cookieParser());
app.use("/auth", authRoutes);
app.use("/expense", expenseRoutes);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("listening on port 3000"));
