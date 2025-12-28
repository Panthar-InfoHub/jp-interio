import { Router } from "express";
import { ai_controller } from "../controller/ai.controller.js";

export const ai_router = Router();

ai_router.post("/redesign-room", ai_controller.reDesignRoomController);