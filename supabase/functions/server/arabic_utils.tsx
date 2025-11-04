// Arabic Text Processing Utilities
// Handles normalization, diacritics removal, synonym mapping, and keyboard layout corrections

/**
 * Remove Arabic diacritics (tashkeel) from text
 */
export function removeDiacritics(text: string): string {
  return text.replace(/[\u064B-\u065F\u0670]/g, '');
}

/**
 * Normalize Arabic text for search
 * - Remove diacritics
 * - Normalize Alef variations (أ إ آ → ا)
 * - Normalize Teh Marbuta (ة → ه)
 * - Normalize Yeh variations (ى → ي)
 */
export function normalizeArabic(text: string): string {
  let normalized = removeDiacritics(text);
  
  // Normalize Alef variations
  normalized = normalized.replace(/[أإآ]/g, 'ا');
  
  // Normalize Teh Marbuta
  normalized = normalized.replace(/ة/g, 'ه');
  
  // Normalize Yeh variations
  normalized = normalized.replace(/ى/g, 'ي');
  
  // Normalize Hamza
  normalized = normalized.replace(/ؤ/g, 'و');
  normalized = normalized.replace(/ئ/g, 'ي');
  
  return normalized.trim().toLowerCase();
}

/**
 * Arabic keyboard layout common mistakes
 * Maps commonly confused keys on Arabic keyboard
 */
export const ARABIC_KEYBOARD_TYPOS: Record<string, string[]> = {
  'ض': ['ظ'],
  'ظ': ['ض'],
  'ذ': ['ز'],
  'ز': ['ذ'],
  'ث': ['س'],
  'س': ['ث'],
  'ق': ['ك'],
  'ك': ['ق'],
  'ه': ['ة'],
  'ة': ['ه'],
  'ي': ['ى'],
  'ى': ['ي'],
};

/**
 * Fashion-specific Arabic-English synonym mapping
 */
export const FASHION_SYNONYMS: Record<string, string[]> = {
  // Tops
  'هودي': ['hoodie', 'sweatshirt', 'pullover', 'هودى', 'هوديه'],
  'تيشيرت': ['tshirt', 't-shirt', 'tee', 'تي شيرت', 'تى شيرت'],
  'قميص': ['shirt', 'blouse', 'قمصان'],
  'بلوزة': ['blouse', 'top', 'بلوزه'],
  'سويتشيرت': ['sweatshirt', 'sweater', 'سويت شيرت'],
  
  // Bottoms
  'جينز': ['jeans', 'denim', 'جينس', 'دنيم'],
  'بنطلون': ['pants', 'trousers', 'بنطال'],
  'شورت': ['shorts', 'short', 'شورتات'],
  'تنورة': ['skirt', 'تنوره'],
  
  // Dresses
  'فستان': ['dress', 'فساتين'],
  'عباية': ['abaya', 'عبايه', 'عبايات'],
  'جلابية': ['galabeya', 'jalabiya', 'جلابيه'],
  
  // Outerwear
  'جاكيت': ['jacket', 'جاكت', 'جاكيتات'],
  'معطف': ['coat', 'overcoat', 'معاطف'],
  'سترة': ['vest', 'cardigan', 'ستره'],
  
  // Footwear
  'حذاء': ['shoe', 'shoes', 'احذية', 'احذيه'],
  'سنيكرز': ['sneakers', 'trainers', 'سنيكرس'],
  'صندل': ['sandal', 'sandals', 'صنادل'],
  'كعب': ['heels', 'high heels', 'كعوب'],
  'بوت': ['boots', 'boot', 'بوتات'],
  
  // Accessories
  'حقيبة': ['bag', 'handbag', 'حقائب', 'شنطة'],
  'شنطة': ['bag', 'handbag', 'حقيبة'],
  'حزام': ['belt', 'احزمة'],
  'ساعة': ['watch', 'ساعات'],
  'نظارة': ['glasses', 'sunglasses', 'نظارات'],
  'وشاح': ['scarf', 'اوشحة'],
  'طرحة': ['hijab', 'scarf', 'طرح'],
  
  // Colors
  'اسود': ['black', 'أسود'],
  'ابيض': ['white', 'أبيض'],
  'احمر': ['red', 'أحمر'],
  'ازرق': ['blue', 'أزرق'],
  'اخضر': ['green', 'أخضر'],
  'اصفر': ['yellow', 'أصفر'],
  'بني': ['brown', 'بنى'],
  'رمادي': ['gray', 'grey', 'رمادى'],
  'وردي': ['pink', 'وردى'],
  'بنفسجي': ['purple', 'violet', 'بنفسجى'],
  'برتقالي': ['orange', 'برتقالى'],
  'بيج': ['beige', 'cream'],
  'كحلي': ['navy', 'dark blue', 'كحلى'],
  
  // Materials
  'قطن': ['cotton', 'قطني'],
  'حرير': ['silk', 'حريري'],
  'صوف': ['wool', 'صوفي'],
  'جلد': ['leather', 'جلدي'],
  'دنيم': ['denim', 'جينز'],
  'بوليستر': ['polyester'],
  
  // Styles
  'كاجوال': ['casual', 'كاجول'],
  'رسمي': ['formal', 'رسمى'],
  'رياضي': ['sport', 'athletic', 'رياضى'],
  'كلاسيك': ['classic', 'كلاسيكي'],
  'عصري': ['modern', 'contemporary', 'عصرى'],
  
  // Sizes
  'صغير': ['small', 's', 'صغيره'],
  'متوسط': ['medium', 'm', 'وسط'],
  'كبير': ['large', 'l', 'كبيره'],
  'اكس لارج': ['xl', 'extra large', 'xlarge'],
};

/**
 * Get all synonyms for a term (including the term itself)
 */
export function getSynonyms(term: string): string[] {
  const normalized = normalizeArabic(term.toLowerCase());
  
  // Check if term is a key
  if (FASHION_SYNONYMS[normalized]) {
    return [normalized, ...FASHION_SYNONYMS[normalized]];
  }
  
  // Check if term is a value in any synonym list
  for (const [key, synonyms] of Object.entries(FASHION_SYNONYMS)) {
    if (synonyms.some(syn => syn.toLowerCase() === normalized)) {
      return [key, ...synonyms];
    }
  }
  
  return [normalized];
}

/**
 * Expand query with synonyms
 */
export function expandQueryWithSynonyms(query: string): string[] {
  const words = query.toLowerCase().split(/\s+/);
  const expandedTerms = new Set<string>();
  
  words.forEach(word => {
    const synonyms = getSynonyms(word);
    synonyms.forEach(syn => expandedTerms.add(syn));
  });
  
  return Array.from(expandedTerms);
}

/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy matching and spell correction
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Calculate similarity ratio (0-1) between two strings
 */
export function similarityRatio(str1: string, str2: string): number {
  const distance = levenshteinDistance(str1, str2);
  const maxLen = Math.max(str1.length, str2.length);
  return maxLen === 0 ? 1 : 1 - distance / maxLen;
}

/**
 * Find closest matches for a word (spell correction)
 */
export function findClosestMatches(
  word: string,
  dictionary: string[],
  maxDistance: number = 2,
  limit: number = 5
): Array<{ word: string; distance: number; similarity: number }> {
  const normalized = normalizeArabic(word.toLowerCase());
  
  const matches = dictionary
    .map(dictWord => {
      const normalizedDict = normalizeArabic(dictWord.toLowerCase());
      const distance = levenshteinDistance(normalized, normalizedDict);
      const similarity = similarityRatio(normalized, normalizedDict);
      
      return { word: dictWord, distance, similarity };
    })
    .filter(match => match.distance <= maxDistance)
    .sort((a, b) => {
      // Sort by distance first, then by similarity
      if (a.distance !== b.distance) {
        return a.distance - b.distance;
      }
      return b.similarity - a.similarity;
    })
    .slice(0, limit);
  
  return matches;
}

/**
 * Apply keyboard typo corrections
 */
export function correctKeyboardTypos(word: string): string[] {
  const suggestions = [word];
  
  for (let i = 0; i < word.length; i++) {
    const char = word[i];
    const alternatives = ARABIC_KEYBOARD_TYPOS[char];
    
    if (alternatives) {
      alternatives.forEach(alt => {
        const corrected = word.substring(0, i) + alt + word.substring(i + 1);
        suggestions.push(corrected);
      });
    }
  }
  
  return suggestions;
}

/**
 * Normalize English text for search
 */
export function normalizeEnglish(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars except hyphen
    .replace(/\s+/g, ' '); // Normalize whitespace
}

/**
 * Detect if text is primarily Arabic
 */
export function isArabic(text: string): boolean {
  const arabicChars = text.match(/[\u0600-\u06FF]/g);
  return arabicChars ? arabicChars.length > text.length * 0.3 : false;
}

/**
 * Normalize text based on detected language
 */
export function normalizeText(text: string): string {
  if (isArabic(text)) {
    return normalizeArabic(text);
  }
  return normalizeEnglish(text);
}

/**
 * Tokenize text into searchable terms
 */
export function tokenize(text: string): string[] {
  const normalized = normalizeText(text);
  return normalized.split(/\s+/).filter(token => token.length > 0);
}

/**
 * Debug logging helper
 */
export function logArabicProcessing(original: string, normalized: string, synonyms: string[]) {
  console.log('🔤 Arabic Processing:');
  console.log('  Original:', original);
  console.log('  Normalized:', normalized);
  console.log('  Synonyms:', synonyms.join(', '));
}
