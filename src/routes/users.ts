import Hapi from '@hapi/hapi';
import { db } from '../db/index.js';
import { users } from '../schema.js';
import { eq } from 'drizzle-orm';

export const userRoutes: Hapi.ServerRoute[] = [
    {
        method: 'POST',
        path: '/users',
        handler: async (request, h) => {
            const { name, email } = request.payload as { name: string; email: string };
            try {
                const newUser = await db.insert(users).values({ name, email }).returning();
                return h.response(newUser[0]).code(201);
            } catch (err: any) {
                return h.response({ error: err.message }).code(400);
            }
        },
    },
    {
        method: 'GET',
        path: '/users',
        handler: async (request, h) => {
            try {
                const allUsers = await db.select().from(users);
                return allUsers;
            } catch (err: any) {
                return h.response({ error: err.message }).code(500);
            }
        },
    },
    {
        method: 'GET',
        path: '/users/{id}',
        handler: async (request, h) => {
            const id = parseInt(request.params.id);
            try {
                const user = await db.select().from(users).where(eq(users.id, id));
                if (user.length === 0) {
                    return h.response({ message: 'User not found' }).code(404);
                }
                return user[0];
            } catch (err: any) {
                return h.response({ error: err.message }).code(500);
            }
        },
    },
    {
        method: 'PUT',
        path: '/users/{id}',
        handler: async (request, h) => {
            const id = parseInt(request.params.id);
            const { name, email } = request.payload as { name: string; email: string };
            try {
                const updatedUser = await db.update(users)
                    .set({ name, email })
                    .where(eq(users.id, id))
                    .returning();
                
                if (updatedUser.length === 0) {
                    return h.response({ message: 'User not found' }).code(404);
                }
                return updatedUser[0];
            } catch (err: any) {
                return h.response({ error: err.message }).code(400);
            }
        },
    },
    {
        method: 'DELETE',
        path: '/users/{id}',
        handler: async (request, h) => {
            const id = parseInt(request.params.id);
            try {
                const deletedUser = await db.delete(users).where(eq(users.id, id)).returning();
                if (deletedUser.length === 0) {
                    return h.response({ message: 'User not found' }).code(404);
                }
                return h.response({ message: 'User deleted successfully' }).code(200);
            } catch (err: any) {
                return h.response({ error: err.message }).code(500);
            }
        },
    },
];
