import Hapi from '@hapi/hapi';
import { db } from '../db/index.js';
import { users } from '../schema.js';
import { eq } from 'drizzle-orm';
import Joi from 'joi'

export const userRoutes: Hapi.ServerRoute[] = [
  {
    method: 'POST',
    path: '/users',
    options: {
      description: 'Create a new user',
      tags: ['api', 'users'],
      validate: {
        payload: Joi.object({
          name: Joi.string().required(),
          email: Joi.string().email().required(),
        }),
      },
    },
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
    options: {
      description: 'Get a all users',
      notes: 'Returns a user objects',
      tags: ['api', 'users'],
    },

    handler: async (_, h) => {
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
    options: {
      description: 'Get a user by UUID',
      notes: 'Returns a user object based on the provided UUID',
      tags: ['api', 'users'],
      validate: {
        params: Joi.object({
          id: Joi.string().guid().required(),
        }),
      },
    },
    handler: async (request, h) => {
      const id = request.params.id as string;
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
    method: 'PATCH',
    path: '/users/{id}',
    options: {
      tags: ['api', 'users'],
      description: 'Update a user partially',
      validate: {
        params: Joi.object({ id: Joi.string().guid().required() }),
        payload: Joi.object({
          name: Joi.string().min(3).max(50).optional(),
          email: Joi.string().email().optional(),
        }).or('name', 'email'),
      },
    },
    handler: async (request, h) => {
      const id = request.params.id as string;
      const payload = request.payload as { name?: string; email?: string };
      if (!payload) return h.response({ message: 'No data provided' }).code(400);

      const { name, email } = payload;
      const updates: Partial<typeof users.$inferInsert> = {};
      if (name !== undefined) updates.name = name;
      if (email !== undefined) updates.email = email;

      try {
        const updatedUser = await db.update(users).set(updates).where(eq(users.id, id)).returning();
        if (updatedUser.length === 0) return h.response({ message: 'User not found' }).code(404);
        return updatedUser[0];
      } catch (err: any) {
        return h.response({ error: err.message }).code(400);
      }
    },
  },
  {
    method: 'DELETE',
    path: '/users/{id}',
    options: {
      tags: ['api', 'users'],
      description: 'Delete a user given their UUID',
      validate: {
        params: Joi.object({
          id: Joi.string().guid().required(),
        }),
      },
    },
    handler: async (request, h) => {
      const id = request.params.id as string;
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
