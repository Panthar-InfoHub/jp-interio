import axios from "axios";
import { storage } from "../lib/cloud_storage.js";
import { fal_model } from "../lib/fal.ai.js";
import { model } from "../lib/verexai.js";
import AppError from "../middlwares/ErrorMiddleware.js";
import logger from "../middlwares/logger.js";


export class AiServiceClass {

    async uploadImageToBucket(image_source: string | Buffer, file_name?: string, is_buffer: boolean = false) {

        if (!image_source) throw new Error("No image data to save");

        const buffer = is_buffer ? (image_source as Buffer) : Buffer.from(image_source as string, 'base64');
        const key = `generated/${Date.now()}-redesign-${file_name || 'room'}.png`;
        const file = storage.bucket(process.env.BUCKET_NAME!).file(key);

        // 1. Upload the file
        await file.save(buffer, {
            metadata: { contentType: 'image/png' },
            resumable: false
        });
        await file.makePublic();

        return {
            public_url: `https://storage.googleapis.com/${process.env.BUCKET_NAME}/${key}`,
            gs_uri: `gs://${process.env.BUCKET_NAME}/${key}`
        };
    }



    private async getGeminiDescription(gs_uri: string, stryle_prompt: string) {
        const prompt = `
            You are an Interior Design Expert.
            Attached is a redesigned room image based on the style: "${stryle_prompt}".
            Provide a short yet descriptive professional explanation of the changes made (e.g., lighting, furniture, layout) do remember to keep it short maximum 2 - 3 lines.
        `;

        const response: any = await model.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                { text: prompt },
                { fileData: { fileUri: gs_uri, mimeType: 'image/png' } }
            ]
        });

        logger.debug(`Image description response: `, response);
        return response.text;;
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
            4. If there is any instruction that cannot be followed, explain why in the text response instead of generating an image.
        `;

        const result: any = await fal_model.subscribe("fal-ai/flux-pro/kontext", {
            input: {
                image_url: image_uri,
                prompt,
                guidance_scale: 7.5,
                // num_inference_steps: 30,
                // enable_safety_checker: true
            },
        })


        logger.debug(`Fal.ai response: `, result);

        if (!result.data || !result.data.images || result.data.images.length === 0) {
            throw new AppError('Fal.ai failed to generate an image.');
        }


        const response = await axios.get(result.data.images[0].url, { responseType: 'arraybuffer' });
        const img_buffer = Buffer.from(response.data);

        const { public_url, gs_uri } = await this.uploadImageToBucket(img_buffer!, 'fal-design', true);

        logger.debug(`Image saved to GCS: ${public_url}`);

        logger.debug(`Getting img description from Vertex...`);
        const img_description = await this.getGeminiDescription(gs_uri, stylePrompt);

        return {
            image_uri: public_url,
            description: img_description
        };

    }

}

export const ai_service = new AiServiceClass();