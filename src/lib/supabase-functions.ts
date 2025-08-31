// Supabase Functions Configuration
export const SUPABASE_FUNCTIONS = {
  // Base URL for your Supabase project
  BASE_URL: 'https://nsmrxwnrtsllxvplazmm.supabase.co',
  
  // Function endpoints
  PRINTFUL_DIRECT_IMPORT: '/functions/v1/printful-direct-import',
  PRINTFUL_SYNC_AVAILABILITY: '/functions/v1/printful-sync-availability',
  PRINTFUL_IMPORT_VARIANTS: '/functions/v1/printful-import-variants',
};

// Helper function to get full function URL
export function getFunctionUrl(functionPath: string): string {
  return `${SUPABASE_FUNCTIONS.BASE_URL}${functionPath}`;
}

// Individual function URLs
export const functionUrls = {
  directImport: getFunctionUrl(SUPABASE_FUNCTIONS.PRINTFUL_DIRECT_IMPORT),
  syncAvailability: getFunctionUrl(SUPABASE_FUNCTIONS.PRINTFUL_SYNC_AVAILABILITY),
  importVariants: getFunctionUrl(SUPABASE_FUNCTIONS.PRINTFUL_IMPORT_VARIANTS),
};
