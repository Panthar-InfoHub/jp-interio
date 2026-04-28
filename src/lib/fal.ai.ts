import { fal } from "@fal-ai/client";

fal.config({
    credentials: process.env.FAL_KEY,
});

// Export the configured instance
export { fal as fal_model };