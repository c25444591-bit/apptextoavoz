import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { text, voiceSampleBase64, language = 'es' } = req.body;

        if (!text || !voiceSampleBase64) {
            return res.status(400).json({ error: 'Missing required fields: text, voiceSampleBase64' });
        }

        // Get Hugging Face API Key from environment
        const HF_API_KEY = process.env.VITE_HUGGINGFACE_API_KEY || process.env.HUGGINGFACE_API_KEY;

        if (!HF_API_KEY) {
            return res.status(500).json({ error: 'Hugging Face API Key not configured' });
        }

        // Convert base64 to buffer
        const base64Data = voiceSampleBase64.includes(',')
            ? voiceSampleBase64.split(',')[1]
            : voiceSampleBase64;

        const audioBuffer = Buffer.from(base64Data, 'base64');

        // Prepare form data for Hugging Face
        const FormData = (await import('form-data')).default;
        const formData = new FormData();

        formData.append('inputs', text);
        formData.append('speaker_wav', audioBuffer, {
            filename: 'reference.wav',
            contentType: 'audio/wav'
        });
        formData.append('language', language);

        // Call Hugging Face API
        const response = await fetch(
            'https://api-inference.huggingface.co/models/coqui/XTTS-v2',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${HF_API_KEY}`,
                    ...formData.getHeaders()
                },
                body: formData as any
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Hugging Face error:', errorText);

            if (response.status === 503) {
                return res.status(503).json({
                    error: 'Model is loading. Please try again in 20 seconds.'
                });
            }

            return res.status(response.status).json({
                error: `Hugging Face API error: ${response.statusText}`
            });
        }

        // Get audio blob from response
        const audioBlob = await response.arrayBuffer();
        const audioBase64 = Buffer.from(audioBlob).toString('base64');

        // Return base64 audio
        return res.status(200).json({
            success: true,
            audio: audioBase64
        });

    } catch (error: any) {
        console.error('Voice cloning error:', error);
        return res.status(500).json({
            error: error.message || 'Internal server error'
        });
    }
}
