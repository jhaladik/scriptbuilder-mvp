// === functions/api/test.ts ===
export interface Env {
    DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    try {
        // Simple test query
        const result = await context.env.DB.prepare("SELECT 1 as test").first();
        
        return new Response(JSON.stringify({ 
            status: 'ok', 
            database: 'connected',
            test: result?.test
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ 
            status: 'error', 
            message: error.message 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};