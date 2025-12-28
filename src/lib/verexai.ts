import { VertexAI } from "@google-cloud/vertexai";

const authOptions = {
    credentials: {
        client_email: process.env.GCP_CLIENT_EMAIL!,
        private_key: process.env.GCP_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    },
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
};

const vertexAI = new VertexAI({
    project: process.env.GCP_PROJECT_ID,
    location: 'us-central1',
    googleAuthOptions: authOptions
});

// Nano Banana Model
export const model = vertexAI.getGenerativeModel({ model: 'gemini-2.5-flash-image' });