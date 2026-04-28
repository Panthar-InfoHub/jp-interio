// import { VertexAI } from "@google-cloud/vertexai";

// const authOptions = {
//     credentials: {
//         client_email: process.env.GCP_CLIENT_EMAIL!,
//         private_key: process.env.GCP_PRIVATE_KEY!.replace(/\\n/g, "\n"),
//     },
//     scopes: ['https://www.googleapis.com/auth/cloud-platform']
// };

// const vertexAI = new VertexAI({
//     project: process.env.GCP_PROJECT_ID,
//     location: 'us-central1',
//     googleAuthOptions: authOptions
// });

// // Text Model
// export const model = vertexAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

import { GoogleGenAI } from "@google/genai";

// This is the new 2026 unified client
export const model = new GoogleGenAI({
    vertexai: true,
    project: process.env.GCP_PROJECT_ID,
    location: 'us-central1',
    googleAuthOptions: {
        credentials: {
            client_email: process.env.GCP_CLIENT_EMAIL!,
            private_key: process.env.GCP_PRIVATE_KEY!.replace(/\\n/g, "\n"),
        },
        scopes: ['https://www.googleapis.com/auth/cloud-platform']
    }
});