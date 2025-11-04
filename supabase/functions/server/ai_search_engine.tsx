// AI-Powered Search Engine
// Implements fuzzy matching, BM25 scoring, and semantic search

import {
  normalizeText,
  tokenize,
  getSynonyms,
  expandQueryWithSynonyms,
  levenshteinDistance,
  similarityRatio,
  findClosestMatches,
  correctKeyboardTypos,
  isArabic,
} from './arabic_utils.tsx';

import {
  getTextEmbedding,
  getImageEmbedding,
  cosineSimilarity,
} from './huggingface_client.tsx';

/**
 * BM25 Parameters
 * k1: term frequency saturation parameter (1.2-2.0)
 * b: length normalization parameter (0.75)
 */
const BM25_K1 = 1.5;
const BM25_B = 0.75;

/**
 * Product interface for search
 */
interface Product {
  id: string;
  name: string;
  description?: string;
  category?: string;
  brand?: string;
  color?: string;
  price?: number;
  imageUrl?: string;
  clipEmbedding?: number[];
  [key: string]: any;
}

/**
 * Search result with score and debug info
 */
interface SearchResult {
  product: Product;
  score: number;
  debug?: {
    bm25Score?: number;
    fuzzyScore?: number;
    semanticScore?: number;
    matchedTerms?: string[];
    matchType?: string;
  };
}

/**
 * Calculate term frequency in document
 */
function termFrequency(term: string, document: string[]): number {
  return document.filter(t => t === term).length;
}

/**
 * Calculate inverse document frequency
 */
function inverseDocumentFrequency(
  term: string,
  documents: string[][],
  totalDocs: number
): number {
  const docsWithTerm = documents.filter(doc => doc.includes(term)).length;
  return Math.log((totalDocs - docsWithTerm + 0.5) / (docsWithTerm + 0.5) + 1);
}

/**
 * Calculate BM25 score for a document
 */
function calculateBM25(
  queryTerms: string[],
  document: string[],
  allDocuments: string[][],
  avgDocLength: number
): number {
  const totalDocs = allDocuments.length;
  let score = 0;

  for (const term of queryTerms) {
    const tf = termFrequency(term, document);
    const idf = inverseDocumentFrequency(term, allDocuments, totalDocs);
    const docLength = document.length;

    const numerator = tf * (BM25_K1 + 1);
    const denominator = tf + BM25_K1 * (1 - BM25_B + BM25_B * (docLength / avgDocLength));

    score += idf * (numerator / denominator);
  }

  return score;
}

/**
 * Build searchable text from product
 */
function buildSearchableText(product: Product): string {
  const parts = [
    product.name || '',
    product.description || '',
    product.category || '',
    product.brand || '',
    product.color || '',
  ];

  return parts.filter(p => p).join(' ').toLowerCase();
}

/**
 * Tokenize product for search
 */
function tokenizeProduct(product: Product): string[] {
  const searchableText = buildSearchableText(product);
  return tokenize(searchableText);
}

/**
 * Calculate fuzzy match score
 */
function calculateFuzzyScore(query: string, product: Product): number {
  const searchableText = buildSearchableText(product);
  const queryNormalized = normalizeText(query);
  const textNormalized = normalizeText(searchableText);

  // Exact match
  if (textNormalized.includes(queryNormalized)) {
    return 1.0;
  }

  // Check each word
  const queryWords = queryNormalized.split(/\s+/);
  const textWords = textNormalized.split(/\s+/);

  let totalSimilarity = 0;
  let matchCount = 0;

  for (const queryWord of queryWords) {
    let bestMatch = 0;

    for (const textWord of textWords) {
      const similarity = similarityRatio(queryWord, textWord);
      if (similarity > bestMatch) {
        bestMatch = similarity;
      }
    }

    if (bestMatch > 0.7) {
      // Threshold for fuzzy match
      totalSimilarity += bestMatch;
      matchCount++;
    }
  }

  return matchCount > 0 ? totalSimilarity / queryWords.length : 0;
}

/**
 * Spell check and correct query
 */
export function spellCheckQuery(
  query: string,
  productDictionary: string[]
): {
  corrected: string;
  suggestions: string[];
  confidence: number;
  corrections: Array<{ original: string; corrected: string; confidence: number }>;
} {
  const words = query.split(/\s+/);
  const corrections: Array<{ original: string; corrected: string; confidence: number }> = [];
  const correctedWords: string[] = [];

  for (const word of words) {
    const normalized = normalizeText(word);

    // Check if word exists in dictionary
    if (productDictionary.includes(normalized)) {
      correctedWords.push(word);
      continue;
    }

    // Try keyboard typo corrections
    const typoSuggestions = correctKeyboardTypos(normalized);
    const validTypoCorrection = typoSuggestions.find(suggestion =>
      productDictionary.includes(suggestion)
    );

    if (validTypoCorrection) {
      correctedWords.push(validTypoCorrection);
      corrections.push({
        original: word,
        corrected: validTypoCorrection,
        confidence: 0.9,
      });
      continue;
    }

    // Find closest matches
    const matches = findClosestMatches(normalized, productDictionary, 2, 3);

    if (matches.length > 0 && matches[0].similarity > 0.7) {
      correctedWords.push(matches[0].word);
      corrections.push({
        original: word,
        corrected: matches[0].word,
        confidence: matches[0].similarity,
      });
    } else {
      correctedWords.push(word);
    }
  }

  const corrected = correctedWords.join(' ');
  const confidence = corrections.length > 0
    ? corrections.reduce((sum, c) => sum + c.confidence, 0) / corrections.length
    : 1.0;

  // Generate alternative suggestions
  const suggestions: string[] = [];
  if (corrections.length > 0) {
    // Try different combinations of corrections
    suggestions.push(corrected);
  }

  return {
    corrected,
    suggestions,
    confidence,
    corrections,
  };
}

/**
 * Enhanced text search with BM25 and fuzzy matching
 */
export async function searchText(
  query: string,
  products: Product[],
  options: {
    limit?: number;
    minScore?: number;
    useSemanticSearch?: boolean;
    filters?: {
      category?: string;
      priceRange?: { min?: number; max?: number };
      colors?: string[];
    };
  } = {}
): Promise<{
  results: SearchResult[];
  correctedQuery?: string;
  suggestions?: string[];
  debug: {
    originalQuery: string;
    normalizedQuery: string;
    expandedTerms: string[];
    totalProducts: number;
    executionTime: number;
  };
}> {
  const startTime = Date.now();
  const limit = options.limit || 20;
  const minScore = options.minScore || 0.1;

  console.log('🔍 Text Search:', query);

  // Normalize and expand query
  const normalizedQuery = normalizeText(query);
  const expandedTerms = expandQueryWithSynonyms(query);
  const queryTerms = tokenize(expandedTerms.join(' '));

  console.log('  Normalized:', normalizedQuery);
  console.log('  Expanded terms:', expandedTerms.join(', '));

  // Build dictionary from products for spell checking
  const dictionary = new Set<string>();
  products.forEach(product => {
    tokenizeProduct(product).forEach(token => dictionary.add(token));
  });

  // Spell check
  const spellCheck = spellCheckQuery(query, Array.from(dictionary));
  const correctedQuery = spellCheck.corrected !== query ? spellCheck.corrected : undefined;

  if (correctedQuery) {
    console.log('  Spell corrected:', correctedQuery);
  }

  // Apply filters
  let filteredProducts = products;

  if (options.filters) {
    if (options.filters.category) {
      filteredProducts = filteredProducts.filter(
        p => p.category?.toLowerCase() === options.filters!.category!.toLowerCase()
      );
    }

    if (options.filters.priceRange) {
      filteredProducts = filteredProducts.filter(p => {
        if (!p.price) return true;
        const { min, max } = options.filters!.priceRange!;
        if (min !== undefined && p.price < min) return false;
        if (max !== undefined && p.price > max) return false;
        return true;
      });
    }

    if (options.filters.colors && options.filters.colors.length > 0) {
      filteredProducts = filteredProducts.filter(p =>
        options.filters!.colors!.some(color =>
          p.color?.toLowerCase().includes(color.toLowerCase())
        )
      );
    }
  }

  // Tokenize all products
  const allDocuments = filteredProducts.map(p => tokenizeProduct(p));
  const avgDocLength =
    allDocuments.reduce((sum, doc) => sum + doc.length, 0) / allDocuments.length;

  // Calculate scores
  const results: SearchResult[] = [];

  for (let i = 0; i < filteredProducts.length; i++) {
    const product = filteredProducts[i];
    const document = allDocuments[i];

    // BM25 score
    const bm25Score = calculateBM25(queryTerms, document, allDocuments, avgDocLength);

    // Fuzzy match score
    const fuzzyScore = calculateFuzzyScore(query, product);

    // Combined score (weighted average)
    const score = bm25Score * 0.6 + fuzzyScore * 0.4;

    if (score >= minScore) {
      results.push({
        product,
        score,
        debug: {
          bm25Score,
          fuzzyScore,
          matchedTerms: queryTerms.filter(term => document.includes(term)),
          matchType: fuzzyScore > 0.8 ? 'exact' : fuzzyScore > 0.5 ? 'fuzzy' : 'partial',
        },
      });
    }
  }

  // Sort by score
  results.sort((a, b) => b.score - a.score);

  // Limit results
  const limitedResults = results.slice(0, limit);

  const executionTime = Date.now() - startTime;
  console.log(`✅ Found ${results.length} results in ${executionTime}ms`);

  return {
    results: limitedResults,
    correctedQuery,
    suggestions: spellCheck.suggestions,
    debug: {
      originalQuery: query,
      normalizedQuery,
      expandedTerms,
      totalProducts: products.length,
      executionTime,
    },
  };
}

/**
 * Image similarity search using CLIP embeddings
 */
export async function searchByImage(
  imageUrl: string,
  products: Product[],
  options: {
    limit?: number;
    minSimilarity?: number;
    useCache?: boolean;
  } = {}
): Promise<{
  results: SearchResult[];
  detectedColors?: string[];
  detectedCategories?: string[];
  debug: {
    imageUrl: string;
    embeddingDimensions: number;
    totalProducts: number;
    productsWithEmbeddings: number;
    executionTime: number;
  };
}> {
  const startTime = Date.now();
  const limit = options.limit || 20;
  const minSimilarity = options.minSimilarity || 0.5;

  console.log('🖼️ Image Search:', imageUrl);

  try {
    // Get image embedding
    const queryEmbedding = await getImageEmbedding(imageUrl);
    console.log(`  Embedding dimensions: ${queryEmbedding.length}`);

    // Filter products with embeddings
    const productsWithEmbeddings = products.filter(p => p.clipEmbedding);
    console.log(`  Products with embeddings: ${productsWithEmbeddings.length}/${products.length}`);

    // Calculate similarities
    const results: SearchResult[] = [];

    for (const product of productsWithEmbeddings) {
      if (!product.clipEmbedding) continue;

      const similarity = cosineSimilarity(queryEmbedding, product.clipEmbedding);

      if (similarity >= minSimilarity) {
        results.push({
          product,
          score: similarity,
          debug: {
            semanticScore: similarity,
            matchType: 'semantic',
          },
        });
      }
    }

    // Sort by similarity
    results.sort((a, b) => b.score - a.score);

    // Limit results
    const limitedResults = results.slice(0, limit);

    const executionTime = Date.now() - startTime;
    console.log(`✅ Found ${results.length} similar products in ${executionTime}ms`);

    return {
      results: limitedResults,
      debug: {
        imageUrl,
        embeddingDimensions: queryEmbedding.length,
        totalProducts: products.length,
        productsWithEmbeddings: productsWithEmbeddings.length,
        executionTime,
      },
    };
  } catch (error: any) {
    console.error('❌ Image search error:', error.message);
    throw error;
  }
}

/**
 * Hybrid search: combine text and image search
 */
export async function hybridSearch(
  textQuery: string,
  imageUrl: string,
  products: Product[],
  options: {
    limit?: number;
    textWeight?: number;
    imageWeight?: number;
  } = {}
): Promise<{
  results: SearchResult[];
  debug: {
    textResults: number;
    imageResults: number;
    combinedResults: number;
    executionTime: number;
  };
}> {
  const startTime = Date.now();
  const limit = options.limit || 20;
  const textWeight = options.textWeight || 0.5;
  const imageWeight = options.imageWeight || 0.5;

  console.log('🔀 Hybrid Search:', { textQuery, imageUrl });

  // Run both searches in parallel
  const [textResults, imageResults] = await Promise.all([
    searchText(textQuery, products, { limit: limit * 2 }),
    searchByImage(imageUrl, products, { limit: limit * 2 }),
  ]);

  // Combine scores
  const scoreMap = new Map<string, { product: Product; score: number }>();

  // Add text results
  textResults.results.forEach(result => {
    scoreMap.set(result.product.id, {
      product: result.product,
      score: result.score * textWeight,
    });
  });

  // Add/merge image results
  imageResults.results.forEach(result => {
    const existing = scoreMap.get(result.product.id);
    if (existing) {
      existing.score += result.score * imageWeight;
    } else {
      scoreMap.set(result.product.id, {
        product: result.product,
        score: result.score * imageWeight,
      });
    }
  });

  // Convert to array and sort
  const results: SearchResult[] = Array.from(scoreMap.values())
    .map(({ product, score }) => ({ product, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  const executionTime = Date.now() - startTime;
  console.log(`✅ Hybrid search complete in ${executionTime}ms`);

  return {
    results,
    debug: {
      textResults: textResults.results.length,
      imageResults: imageResults.results.length,
      combinedResults: results.length,
      executionTime,
    },
  };
}

/**
 * Build product search index (for optimization)
 */
export function buildSearchIndex(products: Product[]): {
  termIndex: Map<string, Set<string>>; // term -> product IDs
  productTokens: Map<string, string[]>; // product ID -> tokens
} {
  const termIndex = new Map<string, Set<string>>();
  const productTokens = new Map<string, string[]>();

  products.forEach(product => {
    const tokens = tokenizeProduct(product);
    productTokens.set(product.id, tokens);

    tokens.forEach(token => {
      if (!termIndex.has(token)) {
        termIndex.set(token, new Set());
      }
      termIndex.get(token)!.add(product.id);
    });
  });

  console.log(`📚 Search index built: ${termIndex.size} unique terms, ${products.length} products`);

  return { termIndex, productTokens };
}
