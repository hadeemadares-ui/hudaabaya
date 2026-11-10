import { Product, ProductVariant } from '../types';
import { extractProductModelCode } from './productUtils';

export interface ParsedProductMatch {
  product: Product;
  variant: ProductVariant;
  matchType: 'exact_code' | 'sku' | 'id' | 'url' | 'title';
  lotNumber?: string;
}

/**
 * Checks if two lot numbers match, handling both full formats (e.g. HUDA-A001-2-69)
 * and short formats (e.g. 2-69) safely and accurately.
 */
export function isMatchingLot(lotA?: string, lotB?: string): boolean {
  if (!lotA || !lotB) return false;
  const a = lotA.trim().toUpperCase();
  const b = lotB.trim().toUpperCase();
  if (a === b) return true;
  if (a.endsWith(`-${b}`) || b.endsWith(`-${a}`)) return true;
  if (a.endsWith(`_${b}`) || b.endsWith(`_${a}`)) return true;
  return false;
}

/**
 * Universal resolver to match scanned QR code or Barcode text with a Product and Variant
 */
export function resolveScannedProduct(
  rawText: string,
  products: Product[]
): ParsedProductMatch | null {
  if (!rawText || !Array.isArray(products) || products.length === 0) {
    return null;
  }

  const text = rawText.trim();
  if (!text) return null;

  // 1. Format: HUDA:PRODUCT_ID:VARIANT_ID or HUDA:PRODUCT_ID:VARIANT_ID:LOT_NUMBER
  if (text.startsWith('HUDA:')) {
    const parts = text.split(':');
    if (parts.length >= 3) {
      const prodId = parts[1].trim();
      const varId = parts[2].trim();
      const lot = parts.length >= 4 ? parts.slice(3).join(':').trim() : undefined;
      const product = products.find((p) => p.id === prodId);
      if (product) {
        const variant = product.variants.find((v) => v.id === varId) || product.variants[0];
        return { product, variant, matchType: 'exact_code', lotNumber: lot || undefined };
      }
    }
  }

  // 2. Format: URL with search params (?product=...&variant=... or ?scan=...)
  if (text.includes('?') && (text.includes('product=') || text.includes('scan='))) {
    try {
      const url = new URL(text.startsWith('http') ? text : `https://dummy.com/${text}`);
      const prodId = url.searchParams.get('product') || url.searchParams.get('id');
      const varId = url.searchParams.get('variant') || url.searchParams.get('var');
      const scanParam = url.searchParams.get('scan');

      if (scanParam && scanParam.includes(':')) {
        const [pId, vId] = scanParam.split(':');
        const product = products.find((p) => p.id === pId);
        if (product) {
          const variant = product.variants.find((v) => v.id === vId) || product.variants[0];
          return { product, variant, matchType: 'url' };
        }
      }

      if (prodId) {
        const product = products.find((p) => p.id === prodId);
        if (product) {
          const variant = product.variants.find((v) => v.id === varId) || product.variants[0];
          return { product, variant, matchType: 'url' };
        }
      }
    } catch (e) {}
  }

  // 3. Format: JSON payload
  if (text.startsWith('{') && text.endsWith('}')) {
    try {
      const parsed = JSON.parse(text);
      const prodId = parsed.productId || parsed.id || parsed.pid;
      const varId = parsed.variantId || parsed.varId || parsed.vid || parsed.var;

      if (prodId) {
        const product = products.find((p) => p.id === prodId);
        if (product) {
          const variant = product.variants.find((v) => v.id === varId) || product.variants[0];
          return { product, variant, matchType: 'exact_code' };
        }
      }
    } catch (e) {}
  }

  // 4. Match by exact Product ID
  const directProduct = products.find((p) => p.id === text);
  if (directProduct) {
    return { product: directProduct, variant: directProduct.variants[0], matchType: 'id' };
  }

  // 5. Match by exact Variant ID
  for (const p of products) {
    const vMatch = p.variants.find((v) => v.id === text);
    if (vMatch) {
      return { product: p, variant: vMatch, matchType: 'id' };
    }
  }

  // Normalized search representations
  const lowerText = text.toLowerCase();
  const cleanCode = text
    .replace(/^HUDA[-_:]?/i, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();

  // 6. Format: SKU matching starting with HUDA- (e.g. HUDA-A005-1-69, HUDA-C006, etc.)
  if (text.toUpperCase().startsWith('HUDA-')) {
    // 6.1 Match by Product Model Code in title (e.g. "A001", "C006", "A019")
    for (const p of products) {
      const modelCode = extractProductModelCode(p.title, p.id);
      if (modelCode && modelCode.length >= 2) {
        if (text.toUpperCase().startsWith(`HUDA-${modelCode}`)) {
          const remainder = text.slice(`HUDA-${modelCode}`.length).replace(/^[-_]/, '').trim();
          return { product: p, variant: p.variants[0], matchType: 'sku', lotNumber: remainder || undefined };
        }
      }
    }

    // 6.2 Candidate SKU matching with variant name
    for (const p of products) {
      for (const v of p.variants) {
        const cleanProd = p.id.replace('huda-prod-', '').replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase();
        const cleanVar = v.name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        const candidateSku = `HUDA-${cleanProd}-${cleanVar}`;
        if (text.toUpperCase() === candidateSku) {
          return { product: p, variant: v, matchType: 'sku' };
        }
      }
    }

    // 6.3 Match short SKU format: HUDA-[PROD_ID_SHORT]-[LOT] or HUDA-[PROD_ID_SHORT]
    for (const p of products) {
      const cleanProd = p.id.replace('huda-prod-', '').replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase();
      if (text.toUpperCase().startsWith(`HUDA-${cleanProd}`)) {
        const remainder = text.slice(`HUDA-${cleanProd}`.length).replace(/^[-_]/, '').trim();
        return { product: p, variant: p.variants[0], matchType: 'sku', lotNumber: remainder || undefined };
      }
    }
  }

  // 7. Match by Product Model Code directly (e.g. user scans or types "c006", "C006", "c-006", "a019", "A-019")
  if (cleanCode && cleanCode.length >= 2) {
    for (const p of products) {
      const modelCode = extractProductModelCode(p.title, p.id);
      const cleanModel = modelCode ? modelCode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() : '';
      if (cleanModel && (cleanModel === cleanCode || (cleanCode.startsWith(cleanModel) && cleanModel.length >= 3))) {
        const remainder = cleanCode.slice(cleanModel.length).trim();
        return { product: p, variant: p.variants[0], matchType: 'sku', lotNumber: remainder || undefined };
      }
    }
  }

  // 8. Match by Variant SKU or Barcode
  for (const p of products) {
    for (const v of p.variants) {
      const vSku = v.sku?.toLowerCase();
      const vCleanSku = v.sku ? v.sku.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() : '';
      if (
        (vSku && (vSku === lowerText || vCleanSku === cleanCode)) ||
        (v.barcode && (v.barcode.toLowerCase() === lowerText || v.barcode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() === cleanCode))
      ) {
        return { product: p, variant: v, matchType: 'sku' };
      }
    }
  }

  // 9. Match by Product Title: Exact, StartsWith, or Substring
  // 9.1 Exact Title match
  const exactTitleMatch = products.find((p) => p.title.toLowerCase() === lowerText);
  if (exactTitleMatch) {
    return { product: exactTitleMatch, variant: exactTitleMatch.variants[0], matchType: 'title' };
  }

  // 9.2 Title starts with search text (e.g. "C006 asdaaf ameerat al arab" starts with "c006")
  const startsWithMatch = products.find((p) => p.title.trim().toLowerCase().startsWith(lowerText));
  if (startsWithMatch) {
    return { product: startsWithMatch, variant: startsWithMatch.variants[0], matchType: 'title' };
  }

  // 9.3 Title includes search text (if input length >= 3, e.g. "ameerat" or "asdaaf")
  if (lowerText.length >= 3) {
    const includesMatch = products.find((p) => p.title.toLowerCase().includes(lowerText));
    if (includesMatch) {
      return { product: includesMatch, variant: includesMatch.variants[0], matchType: 'title' };
    }
  }

  // 9.4 Variant name includes search text
  if (lowerText.length >= 2) {
    for (const p of products) {
      const vMatch = p.variants.find((v) => v.name.toLowerCase().includes(lowerText));
      if (vMatch) {
        return { product: p, variant: vMatch, matchType: 'title' };
      }
    }
  }

  return null;
}
