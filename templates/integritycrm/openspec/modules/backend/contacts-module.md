# Módulo Contacts - Ejemplo CRUD Completo

---

## Domain - Interface del Repository

## src/modules/contacts/domain/contact.repository.interface.ts

```typescript
import { Contact, CreateContactDto, UpdateContactDto, ContactWithoutPassword } from '../../../types/index.js';

export interface IContactRepository {
    findById(id: string): Promise<Contact | null>;
    findAll(filters?: ContactFilters, skip?: number, take?: number): Promise<Contact[]>;
    count(filters?: ContactFilters): Promise<number>;
    findByEmail(email: string): Promise<Contact | null>;
    create(data: CreateContactDto): Promise<Contact>;
    update(id: string, data: UpdateContactDto): Promise<Contact>;
    softDelete(id: string): Promise<void>;
}

interface ContactFilters {
    assigneeId?: string;
    company?: string;
    tags?: string[];
    search?: string;
}
```

---

## Infrastructure - Implementación del Repository

## src/modules/contacts/infrastructure/contact.repository.ts

```typescript
import { prisma } from '../../../config/prisma.js';
import { IContactRepository, ContactFilters } from '../domain/contact.repository.interface.js';
import { Contact, CreateContactDto, UpdateContactDto } from '../../../types/index.js';
import { NotFoundError } from '../../../core/errors/AppError.js';

export const contactRepository: IContactRepository = {
    async findById(id: string): Promise<Contact | null> {
        return await prisma.contact.findFirst({
            where: { id, deletedAt: null },
            include: {
                assignee: {
                    select: { id: true, name: true, email: true, avatar: true, avatarColor: true },
                },
                createdBy: {
                    select: { id: true, name: true, email: true },
                },
                _count: { select: { deals: true, tasks: true, emails: true } },
            },
        });
    },

    async findAll(filters?: ContactFilters, skip = 0, take = 10): Promise<Contact[]> {
        const where: any = { deletedAt: null };

        if (filters?.assigneeId) {
            where.assigneeId = filters.assigneeId;
        }

        if (filters?.company) {
            where.company = { contains: filters.company, mode: 'insensitive' };
        }

        if (filters?.tags?.length) {
            where.tags = { hasSome: filters.tags };
        }

        if (filters?.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { email: { contains: filters.search, mode: 'insensitive' } },
                { company: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        return await prisma.contact.findMany({
            where,
            skip,
            take,
            include: {
                assignee: {
                    select: { id: true, name: true, avatar: true, avatarColor: true },
                },
                _count: { select: { deals: true, tasks: true, emails: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    },

    async count(filters?: ContactFilters): Promise<number> {
        const where: any = { deletedAt: null };

        if (filters?.assigneeId) {
            where.assigneeId = filters.assigneeId;
        }

        if (filters?.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { email: { contains: filters.search, mode: 'insensitive' } },
                { company: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        return await prisma.contact.count({ where });
    },

    async findByEmail(email: string): Promise<Contact | null> {
        return await prisma.contact.findFirst({
            where: { email, deletedAt: null },
        });
    },

    async create(data: CreateContactDto): Promise<Contact> {
        const userId = (global as any).currentUserId; // Set by auth middleware

        return await prisma.contact.create({
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
                company: data.company,
                role: data.role,
                avatar: data.avatar,
                avatarColor: data.avatarColor,
                tags: data.tags || [],
                leadScore: data.leadScore || 0,
                source: data.source,
                country: data.country,
                city: data.city,
                linkedin: data.linkedin,
                notes: data.notes,
                assigneeId: data.assigneeId,
                createdById: userId,
            },
            include: {
                assignee: {
                    select: { id: true, name: true, avatar: true, avatarColor: true },
                },
            },
        });
    },

    async update(id: string, data: UpdateContactDto): Promise<Contact> {
        const existing = await prisma.contact.findFirst({ where: { id, deletedAt: null } });
        if (!existing) {
            throw new NotFoundError('Contact not found');
        }

        return await prisma.contact.update({
            where: { id },
            data: {
                ...data,
                tags: data.tags !== undefined ? data.tags : undefined,
            },
            include: {
                assignee: {
                    select: { id: true, name: true, avatar: true, avatarColor: true },
                },
            },
        });
    },

    async softDelete(id: string): Promise<void> {
        const existing = await prisma.contact.findFirst({ where: { id, deletedAt: null } });
        if (!existing) {
            throw new NotFoundError('Contact not found');
        }

        await prisma.contact.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    },
};
```

---

## Application - Servicio

## src/modules/contacts/application/contact.service.ts

```typescript
import { contactRepository } from '../infrastructure/contact.repository.js';
import { ConflictError, NotFoundError } from '../../../core/errors/AppError.js';
import { CreateContactDto, UpdateContactDto, PaginatedResponse, Contact } from '../../../types/index.js';

export const contactService = {
    findAll: async (
        page = 1,
        limit = 10,
        filters?: {
            assigneeId?: string;
            company?: string;
            tags?: string[];
            search?: string;
        }
    ): Promise<PaginatedResponse<Contact>> => {
        const skip = (page - 1) * limit;
        const contacts = await contactRepository.findAll(filters, skip, limit);
        const total = await contactRepository.count(filters);
        const totalPages = Math.ceil(total / limit);

        return {
            data: contacts,
            pagination: { page, limit, total, totalPages },
        };
    },

    findById: async (id: string): Promise<Contact> => {
        const contact = await contactRepository.findById(id);
        if (!contact) {
            throw new NotFoundError('Contact not found');
        }
        return contact;
    },

    create: async (data: CreateContactDto): Promise<Contact> => {
        const existingEmail = await contactRepository.findByEmail(data.email);
        if (existingEmail) {
            throw new ConflictError('Email already registered');
        }

        return await contactRepository.create(data);
    },

    update: async (id: string, data: UpdateContactDto): Promise<Contact> => {
        if (data.email) {
            const existingEmail = await contactRepository.findByEmail(data.email);
            if (existingEmail && existingEmail.id !== id) {
                throw new ConflictError('Email already in use');
            }
        }

        return await contactRepository.update(id, data);
    },

    delete: async (id: string): Promise<void> => {
        await contactRepository.softDelete(id);
    },

    // Statistics
    getStats: async () => {
        const total = await contactRepository.count();
        const withDeals = await contactRepository.count({ search: '' }); // TODO: filter by deals

        return {
            total,
            active: total, // all non-deleted
        };
    },
};
```

---

## Presentation - Controller & Routes

## src/modules/contacts/presentation/contact.controller.ts

```typescript
import { FastifyRequest, FastifyReply } from 'fastify';
import { contactService } from '../application/contact.service.js';
import { CreateContactDtoSchema, UpdateContactDtoSchema } from './contact.dto.js';

export const contactController = {
    findAll: async (request: FastifyRequest, reply: FastifyReply) => {
        const query = request.query as {
            page?: number;
            limit?: number;
            assigneeId?: string;
            company?: string;
            tags?: string;
            search?: string;
        };

        const { page = 1, limit = 10, ...filters } = query;

        const tags = filters.tags ? filters.tags.split(',') : undefined;

        const result = await contactService.findAll(
            Number(page),
            Number(limit),
            { ...filters, tags }
        );

        return reply.send(result);
    },

    findById: async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const contact = await contactService.findById(id);
        return reply.send(contact);
    },

    create: async (request: FastifyRequest, reply: FastifyReply) => {
        const data = CreateContactDtoSchema.parse(request.body);
        const contact = await contactService.create(data);
        return reply.status(201).send(contact);
    },

    update: async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const data = UpdateContactDtoSchema.parse(request.body);
        const contact = await contactService.update(id, data);
        return reply.send(contact);
    },

    delete: async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        await contactService.delete(id);
        return reply.send({ message: 'Contact deleted successfully' });
    },

    stats: async (_request: FastifyRequest, reply: FastifyReply) => {
        const stats = await contactService.getStats();
        return reply.send(stats);
    },
};
```

---

## src/modules/contacts/presentation/contact.routes.ts

```typescript
import { contactController } from './contact.controller.js';
import { requireRoles } from '../../../presentation/middlewares/rbac.js';

const contactRoutes = async (fastify: any, _options: any) => {
    // List with pagination & filters
    fastify.get('/', {
        preHandler: [fastify.authenticate],
        handler: contactController.findAll,
    });

    // Stats
    fastify.get('/stats', {
        preHandler: [fastify.authenticate],
        handler: contactController.stats,
    });

    // Get by ID
    fastify.get('/:id', {
        preHandler: [fastify.authenticate],
        handler: contactController.findById,
    });

    // Create - ADMIN & MANAGER only
    fastify.post('/', {
        preHandler: [fastify.authenticate, requireRoles(['ADMIN', 'MANAGER'])],
        handler: contactController.create,
    });

    // Update - ADMIN & MANAGER only
    fastify.put('/:id', {
        preHandler: [fastify.authenticate, requireRoles(['ADMIN', 'MANAGER'])],
        handler: contactController.update,
    });

    // Delete - ADMIN only
    fastify.delete('/:id', {
        preHandler: [fastify.authenticate, requireRoles(['ADMIN'])],
        handler: contactController.delete,
    });
};

export default contactRoutes;
```

---

## src/modules/contacts/presentation/contact.dto.ts

```typescript
import { z } from 'zod';

export const CreateContactDtoSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email format'),
    phone: z.string().optional(),
    company: z.string().min(1, 'Company is required'),
    role: z.string().optional(),
    avatar: z.string().optional(),
    avatarColor: z.string().optional(),
    tags: z.array(z.string()).optional(),
    leadScore: z.number().min(0).max(100).optional(),
    source: z.string().optional(),
    country: z.string().optional(),
    city: z.string().optional(),
    linkedin: z.string().url().optional().or(z.string()),
    notes: z.string().optional(),
    assigneeId: z.string().uuid().optional(),
});

export type CreateContactDto = z.infer<typeof CreateContactDtoSchema>;

export const UpdateContactDtoSchema = CreateContactDtoSchema.partial();

export type UpdateContactDto = z.infer<typeof UpdateContactDtoSchema>;
```