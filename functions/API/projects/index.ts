// === functions/api/projects/index.ts ===
export interface Env {
    DB: D1Database;
}

// GET /api/projects - List all projects
export const onRequestGet: PagesFunction<Env> = async (context) => {
    try {
        const { results } = await context.env.DB.prepare(`
            SELECT id, name, type, chapter_count, subchapter_count, 
                   created_at, updated_at
            FROM projects 
            ORDER BY updated_at DESC
        `).all();
        
        return new Response(JSON.stringify(results), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

// POST /api/projects - Create or update project
export const onRequestPost: PagesFunction<Env> = async (context) => {
    try {
        const data = await context.request.json();
        
        // Validate required fields
        if (!data.name) {
            return new Response(JSON.stringify({ error: 'Name is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        if (data.id) {
            // Update existing project
            const result = await context.env.DB.prepare(`
                UPDATE projects 
                SET name = ?, type = ?, chapter_count = ?, subchapter_count = ?,
                    syllabus = ?, target_words = ?, structure_json = ?
                WHERE id = ?
            `).bind(
                data.name,
                data.type || 'skripta',
                data.chapterCount || 5,
                data.subchapterCount || 3,
                data.syllabus || '',
                data.targetWords || 1500,
                data.structure ? JSON.stringify(data.structure) : null,
                data.id
            ).run();
            
            if (!result.success) {
                throw new Error('Failed to update project');
            }
            
            return new Response(JSON.stringify({ 
                id: data.id, 
                message: 'Project updated' 
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
            
        } else {
            // Create new project
            const result = await context.env.DB.prepare(`
                INSERT INTO projects (name, type, chapter_count, subchapter_count, 
                                    syllabus, target_words, structure_json)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `).bind(
                data.name,
                data.type || 'skripta',
                data.chapterCount || 5,
                data.subchapterCount || 3,
                data.syllabus || '',
                data.targetWords || 1500,
                data.structure ? JSON.stringify(data.structure) : null
            ).run();
            
            if (!result.success) {
                throw new Error('Failed to create project');
            }
            
            return new Response(JSON.stringify({ 
                id: result.meta.last_row_id, 
                message: 'Project created' 
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};