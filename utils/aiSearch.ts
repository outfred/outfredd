import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: import.meta.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: import.meta.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export interface SearchEnhancement {
  correctedQuery: string;
  translatedQuery?: string;
  colors?: string[];
  categories?: string[];
  priceRange?: { min?: number; max?: number };
  suggestions?: string[];
}

export async function enhanceSearchQuery(
  query: string,
  language: 'ar' | 'en'
): Promise<SearchEnhancement> {
  try {
    const prompt = `You are a fashion search assistant. Analyze this search query and provide structured information.

Query: "${query}"
Language: ${language === 'ar' ? 'Arabic' : 'English'}

Tasks:
1. Correct any spelling mistakes
2. If the query is in Arabic, translate it to English as well
3. Extract any color mentions (e.g., "red dress" → colors: ["red"])
4. Identify product categories (e.g., "dress", "shirt", "shoes", etc.)
5. Extract price range if mentioned (e.g., "under 500" → max: 500)
6. Provide 2-3 alternative search suggestions

Return ONLY a valid JSON object with this exact structure:
{
  "correctedQuery": "corrected query in original language",
  "translatedQuery": "English translation if original was Arabic, otherwise null",
  "colors": ["color1", "color2"],
  "categories": ["category1", "category2"],
  "priceRange": {"min": number or null, "max": number or null},
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 500,
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new Error('No response from AI');
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response');
    }

    const result = JSON.parse(jsonMatch[0]);
    return result;
  } catch (error) {
    console.error('AI search enhancement error:', error);
    return {
      correctedQuery: query,
      suggestions: [],
    };
  }
}

export interface ProductColorAnalysis {
  dominantColors: string[];
  colorHex: string[];
  colorNames: string[];
}

export async function analyzeProductImage(imageUrl: string): Promise<ProductColorAnalysis> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this fashion product image and identify the dominant colors. 
Return ONLY a valid JSON object with this structure:
{
  "dominantColors": ["color name 1", "color name 2"],
  "colorHex": ["#hexcode1", "#hexcode2"],
  "colorNames": ["descriptive name 1", "descriptive name 2"]
}
Limit to 3 most dominant colors.`,
            },
            {
              type: 'image_url',
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
      max_tokens: 300,
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new Error('No response from AI');
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Image analysis error:', error);
    return {
      dominantColors: [],
      colorHex: [],
      colorNames: [],
    };
  }
}

export interface OutfitGenerationParams {
  occasion?: string;
  style?: string;
  colors?: string[];
  budget?: { min?: number; max?: number };
  customPrompt?: string;
  productImages?: string[];
}

export interface OutfitSuggestion {
  items: {
    category: string;
    description: string;
    colors: string[];
    priceRange?: string;
  }[];
  styleNotes: string;
  colorPalette: string[];
}

export async function generateOutfitSuggestions(
  params: OutfitGenerationParams,
  language: 'ar' | 'en'
): Promise<OutfitSuggestion> {
  try {
    let prompt = `You are a professional fashion stylist. Create an outfit suggestion based on these preferences:

${params.occasion ? `Occasion: ${params.occasion}` : ''}
${params.style ? `Style: ${params.style}` : ''}
${params.colors && params.colors.length > 0 ? `Preferred Colors: ${params.colors.join(', ')}` : ''}
${params.budget ? `Budget Range: ${params.budget.min || 0} - ${params.budget.max || 'unlimited'} EGP` : ''}
${params.customPrompt ? `Additional Requirements: ${params.customPrompt}` : ''}

Response Language: ${language === 'ar' ? 'Arabic' : 'English'}

Return ONLY a valid JSON object with this structure:
{
  "items": [
    {
      "category": "item category (e.g., dress, shoes, bag)",
      "description": "detailed description of the item",
      "colors": ["color1", "color2"],
      "priceRange": "estimated price range"
    }
  ],
  "styleNotes": "overall styling tips and how to wear this outfit",
  "colorPalette": ["color1", "color2", "color3"]
}

Include 4-6 items that work well together.`;

    const messages: any[] = [
      {
        role: 'user',
        content: params.productImages && params.productImages.length > 0
          ? [
              { type: 'text', text: prompt },
              ...params.productImages.map(url => ({
                type: 'image_url',
                image_url: { url },
              })),
              {
                type: 'text',
                text: 'Analyze these product images and create an outfit that incorporates similar styles and colors.',
              },
            ]
          : prompt,
      },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new Error('No response from AI');
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Outfit generation error:', error);
    return {
      items: [],
      styleNotes: language === 'ar' ? 'حدث خطأ في إنشاء الاقتراحات' : 'Error generating suggestions',
      colorPalette: [],
    };
  }
}
