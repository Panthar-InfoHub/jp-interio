import { NextFunction, Request, Response } from "express";
import logger from "../middlwares/logger.js";
import AppError from "../middlwares/ErrorMiddleware.js";
import { ai_service } from "../service/ai.service.js";

class AiControllerClass {
    async reDesignRoomController(req: Request, res: Response, next: NextFunction) {
        try {

            const { image_uri, stylePrompt } = req.body;
            if (!image_uri) {
                logger.warn("Missing image_uri in reDesignRoomController");
                throw new AppError("Missing required parameters: image_uri and stylePrompt", 400);
            }

            const { description, image_uri: redesign_image_uri } = await ai_service.redesignRoomFromBucket(image_uri, stylePrompt)

            logger.debug("Description from AI Service:", description);
            logger.debug("Redesigned Image URI from AI Service:", redesign_image_uri);

            res.status(200).json({
                success: true,
                message: "Room redesign successful",
                data: {
                    description,
                    image_uri: redesign_image_uri
                }
            });
            return;

        } catch (error) {
            logger.error("Error in reDesignRoomController:", error);
            next(error);
            return;
        }
    }
}

export const ai_controller = new AiControllerClass();