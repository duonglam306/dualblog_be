import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import bodyParser from "body-parser";
import articleRoutes from "./routes/articleRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import tagRoutes from "./routes/tagRoutes.js";
import mailerRoutes from "./routes/mailerRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();

connectDB();

const app = express();

app.use(cors({
    origin: ["http://localhost:3000","https://duonglt.internship.designveloper.com"],
    credentials: true,
}))
  
  

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.use(express.json({limit: '50mb'}));

app.get("/", (req, res) => {
    res.send("API is running...");
});

app.use("/api/articles", articleRoutes)
app.use("/api/tags", tagRoutes)
app.use("/api", userRoutes)
app.use("/api/mailer", mailerRoutes)

app.use(notFound);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(
    PORT,
    console.log(
        `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow
            .bold
    )
);
