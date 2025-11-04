// HuggingFace Inference API Client
// Provides CLIP embeddings for image similarity and Stable Diffusion for image generation

const HF_API_URL = 'https://api-inference.huggingface.co';
const CLIP_MODEL = 'openai/clip-vit-base-patch32';
const SD_MODEL = 'stabilityai/stable-diffusion-2-1';

/**
 * Get HuggingFace API key from environment
 */
function getHFApiKey(): string {
  return Deno.env.get('HUGGINGFACE_API_KEY') || '';
}

/**
 * Make request to HuggingFace Inference API
 */
async function hfRequest(
  model: string,
  data: any,
  options: { timeout?: number } = {}
): Promise<any> {
  const apiKey = getHFApiKey();
  
  if (!apiKey) {
    console.warn('⚠️ No HUGGINGFACE_API_KEY found, using public API (rate limited)');
  }
  
  const url = `${HF_API_URL}/models/${model}`;
  const timeout = options.timeout || 30000; // 30s default
  
  console.log(`🤗 HuggingFace API Request: ${model}`);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': apiKey ? `Bearer ${apiKey}` : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const error = await response.text();
      console.error('❌ HuggingFace API Error:', response.status, error);
      
      // Check if model is loading
      if (response.status === 503 && error.includes('loading')) {
        throw new Error('Model is loading, please try again in a few seconds');
      }
      
      throw new Error(`HuggingFace API error: ${response.status} ${error}`);
    }
    
    const result = await response.json();
    console.log('✅ HuggingFace API Success');
    return result;
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    
    throw error;
  }
}

/**
 * Get CLIP text embedding
 */
export async function getTextEmbedding(text: string): Promise<number[]> {
  try {
    console.log('📝 Getting CLIP text embedding for:', text.substring(0, 50));
    
    const result = await hfRequest(CLIP_MODEL, {
      inputs: text,
      options: { wait_for_model: true }
    });
    
    // HuggingFace returns embeddings in different formats
    // Handle both array and nested array formats
    const embedding = Array.isArray(result) ? result : result.embeddings || result[0];
    
    if (!embedding || !Array.isArray(embedding)) {
      throw new Error('Invalid embedding format from API');
    }
    
    console.log(`✅ Text embedding generated: ${embedding.length} dimensions`);
    return embedding;
  } catch (error: any) {
    console.error('❌ Text embedding error:', error.message);
    throw error;
  }
}

/**
 * Get CLIP image embedding from URL
 */
export async function getImageEmbedding(imageUrl: string): Promise<number[]> {
  try {
    console.log('🖼️ Getting CLIP image embedding for:', imageUrl);
    
    // Download image first
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status}`);
    }
    
    const imageBlob = await imageResponse.blob();
    const imageBuffer = await imageBlob.arrayBuffer();
    
    // Convert to base64 for HuggingFace API
    const base64Image = btoa(
      String.fromCharCode(...new Uint8Array(imageBuffer))
    );
    
    const result = await hfRequest(CLIP_MODEL, {
      inputs: base64Image,
      options: { wait_for_model: true }
    }, { timeout: 60000 }); // 60s for image processing
    
    const embedding = Array.isArray(result) ? result : result.embeddings || result[0];
    
    if (!embedding || !Array.isArray(embedding)) {
      throw new Error('Invalid embedding format from API');
    }
    
    console.log(`✅ Image embedding generated: ${embedding.length} dimensions`);
    return embedding;
  } catch (error: any) {
    console.error('❌ Image embedding error:', error.message);
    throw error;
  }
}

/**
 * Calculate cosine similarity between two embeddings
 */
export function cosineSimilarity(embedding1: number[], embedding2: number[]): number {
  if (embedding1.length !== embedding2.length) {
    throw new Error('Embeddings must have same dimensions');
  }
  
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  
  for (let i = 0; i < embedding1.length; i++) {
    dotProduct += embedding1[i] * embedding2[i];
    norm1 += embedding1[i] * embedding1[i];
    norm2 += embedding2[i] * embedding2[i];
  }
  
  const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2);
  
  if (magnitude === 0) {
    return 0;
  }
  
  return dotProduct / magnitude;
}

/**
 * Generate image using Stable Diffusion
 */
export async function generateImage(
  prompt: string,
  options: {
    negativePrompt?: string;
    width?: number;
    height?: number;
    numInferenceSteps?: number;
    guidanceScale?: number;
  } = {}
): Promise<{ imageUrl: string; blob: Blob }> {
  try {
    console.log('🎨 Generating image with Stable Diffusion:', prompt);
    
    const params = {
      inputs: prompt,
      parameters: {
        negative_prompt: options.negativePrompt || 'blurry, low quality, distorted',
        width: options.width || 512,
        height: options.height || 512,
        num_inference_steps: options.numInferenceSteps || 50,
        guidance_scale: options.guidanceScale || 7.5,
      },
      options: { wait_for_model: true }
    };
    
    const apiKey = getHFApiKey();
    const url = `${HF_API_URL}/models/${SD_MODEL}`;
    
    console.log('🤗 Stable Diffusion API Request');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': apiKey ? `Bearer ${apiKey}` : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Stable Diffusion API Error:', response.status, error);
      throw new Error(`Image generation failed: ${response.status}`);
    }
    
    const blob = await response.blob();
    
    // Convert blob to base64 data URL
    const buffer = await blob.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    const imageUrl = `data:image/png;base64,${base64}`;
    
    console.log('✅ Image generated successfully');
    
    return { imageUrl, blob };
  } catch (error: any) {
    console.error('❌ Image generation error:', error.message);
    throw error;
  }
}

/**
 * Enhance fashion product prompt for better image generation
 */
export function enhanceFashionPrompt(prompt: string): string {
  const enhancements = [
    'high quality product photography',
    'professional lighting',
    'clean white background',
    'detailed texture',
    'fashion catalog style',
  ];
  
  return `${prompt}, ${enhancements.join(', ')}`;
}

/**
 * Check if HuggingFace API is available
 */
export async function checkHFAvailability(): Promise<{
  available: boolean;
  hasApiKey: boolean;
  error?: string;
}> {
  const hasApiKey = !!getHFApiKey();
  
  try {
    // Test with a simple text embedding
    await getTextEmbedding('test');
    return { available: true, hasApiKey };
  } catch (error: any) {
    return {
      available: false,
      hasApiKey,
      error: error.message,
    };
  }
}

/**
 * Batch process embeddings with rate limiting
 */
export async function batchGetEmbeddings(
  texts: string[],
  delayMs: number = 1000
): Promise<Array<{ text: string; embedding: number[] | null; error?: string }>> {
  const results: Array<{ text: string; embedding: number[] | null; error?: string }> = [];
  
  for (let i = 0; i < texts.length; i++) {
    try {
      const embedding = await getTextEmbedding(texts[i]);
      results.push({ text: texts[i], embedding });
      
      // Add delay between requests to avoid rate limiting
      if (i < texts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    } catch (error: any) {
      console.error(`Failed to get embedding for "${texts[i]}":`, error.message);
      results.push({ text: texts[i], embedding: null, error: error.message });
    }
  }
  
  return results;
}

/**
 * Debug helper: Log embedding statistics
 */
export function logEmbeddingStats(embedding: number[], label: string = 'Embedding') {
  const mean = embedding.reduce((sum, val) => sum + val, 0) / embedding.length;
  const variance = embedding.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / embedding.length;
  const stdDev = Math.sqrt(variance);
  const min = Math.min(...embedding);
  const max = Math.max(...embedding);
  
  console.log(`📊 ${label} Stats:`);
  console.log(`  Dimensions: ${embedding.length}`);
  console.log(`  Mean: ${mean.toFixed(4)}`);
  console.log(`  Std Dev: ${stdDev.toFixed(4)}`);
  console.log(`  Range: [${min.toFixed(4)}, ${max.toFixed(4)}]`);
}
