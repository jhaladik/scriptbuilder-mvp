// === functions/api/projects/[id].ts ===
export interface Env {
    DB: D1Database;
}

// GET /api/projects/:id - Get specific project
export const onRequestGet: PagesFunction<Env> = async (context) => {
    try {
        const projectId = context.params.id;
        
        if (!projectId) {
            return new Response(JSON.stringify({ error: 'Project ID required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const project = await context.env.DB.prepare(`
            SELECT * FROM projects WHERE id = ?
        `).bind(projectId).first();
        
        if (!project) {
            return new Response(JSON.stringify({ error: 'Project not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Parse structure JSON
        let structure = null;
        if (project.structure_json) {
            try {
                structure = JSON.parse(project.structure_json);
            } catch (e) {
                console.error('Failed to parse structure JSON:', e);
            }
        }
        
        const result = {
            id: project.id,
            name: project.name,
            type: project.type,
            chapterCount: project.chapter_count,
            subchapterCount: project.subchapter_count,
            syllabus: project.syllabus,
            targetWords: project.target_words,
            structure: structure,
            created_at: project.created_at,
            updated_at: project.updated_at
        };
        
        return new Response(JSON.stringify(result), {
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};