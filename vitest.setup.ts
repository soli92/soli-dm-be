/**
 * Mock globale di `lib/supabase` (builder in-memory + coda risposte).
 * I test d’integrazione usano `mockDb`, `dbOk`, `dbList` da `./src/test/registerSupabaseMock`.
 */
import "./src/test/registerSupabaseMock";

process.env.SUPABASE_URL ??= "https://test-project.supabase.co";
process.env.SUPABASE_SERVICE_KEY ??= "test-service-role-key";
