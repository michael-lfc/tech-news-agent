import express from "express";
import { getTechNews } from "../controllers/newsController.js";

const router = express.Router();

router.get("/", getTechNews);

export default router;
