/**
 * Valori fittizi così `createClient` non fallisce al caricamento dei moduli route in test.
 * Le chiamate Supabase non sono eseguite nei test HTTP che usano solo route statiche / dadi.
 */
process.env.SUPABASE_URL ??= "https://test-project.supabase.co";
process.env.SUPABASE_SERVICE_KEY ??= "test-service-role-key";
