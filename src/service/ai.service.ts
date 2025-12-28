import { storage } from "../lib/cloud_storage.js";
import { model } from "../lib/verexai.js";
import AppError from "../middlwares/ErrorMiddleware.js";
import logger from "../middlwares/logger.js";

export class AiServiceClass {

    async uploadImageToBucket(imageBase64: string, file_name?: string) {
        if (!imageBase64) throw new Error("No image data to save");

        const buffer = Buffer.from(imageBase64, 'base64');
        const key = `generated/${Date.now()}-redesign-${file_name || 'room'}.png`;
        const file = storage.bucket(process.env.BUCKET_NAME!).file(key);

        // 1. Upload the file
        await file.save(buffer, {
            metadata: { contentType: 'image/png' },
            resumable: false
        });
        await file.makePublic();
        const publicUrl = `https://storage.googleapis.com/${process.env.BUCKET_NAME}/${key}`;

        return publicUrl;
    }




    async redesignRoomFromBucket(image_uri: string, stylePrompt: string = "realistic, minimal modern interior design with clean style for example japanese or korean style") {
        // image_uri should look like: "gs://your-bucket-name/uploads/room.jpg"
        logger.debug(`Processing image from bucket: ${image_uri}`);

        const prompt = `
            Role: Expert Interior Designer.
            Task: Redesign the attached room image in the style of "${stylePrompt}".
            Constraints: 
            1. STRICTLY preserve the room layout, walls, windows, and perspective.
            2. Generate a high-quality photorealistic image.
            3. Provide a simple yet brief text explanation of the design changes.
        `;

        const request = {
            contents: [{
                role: 'user',
                parts: [
                    { text: prompt },
                    {
                        fileData: {
                            mimeType: 'image/jpeg',
                            fileUri: image_uri // Gemini reads strictly from your private bucket
                        }
                    }
                ]
            }],
        };

        const result = await model.generateContent(request);
        const response = result.response;

        if (!response.candidates || response.candidates.length === 0) {
            throw new AppError('No candidates returned from Gemini model.');
        }
        const parts = response.candidates[0].content.parts;

        let generatedImageBase64 = null;
        let explanationText = "";

        parts.forEach(part => {
            if (part.text) explanationText += part.text;
            if (part.inlineData) generatedImageBase64 = part.inlineData.data;
        });

        // Upload the generated image to Cloud Storage and get its public URL
        const public_uri = await this.uploadImageToBucket(generatedImageBase64!);

        return {
            image_uri: public_uri,
            description: explanationText
        };

    }

}

export const ai_service = new AiServiceClass();