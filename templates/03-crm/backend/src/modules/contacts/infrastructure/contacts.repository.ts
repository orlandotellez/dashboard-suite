import { prisma } from '../../../config/prisma.js'
import { cacheService, buildCacheKey, CACHE_TTL } from '../../../infrastructure/cache.js'
import { IContactsRepository } from '../domain/contacts.repository.interface.js'
import { Contact } from '../../../types/index.js'

export class ContactsRepository implements IContactsRepository {
  async findAll(params: {
    page: number
    limit: number
    search?: string
    assigneeId?: string
  }): Promise<{ data: Contact[]; total: number }> {
    const { page, limit, search, assigneeId } = params
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {
      deletedAt: null,
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (assigneeId) {
      where.assigneeId = assigneeId
    }

    // Only cache first page without filters
    const isCacheable = page === 1 && !search && !assigneeId

    if (isCacheable) {
      const cacheKey = buildCacheKey('contacts', 'list', 'page1')
      const cached = await cacheService.get<{ data: Contact[]; total: number }>(cacheKey)
      if (cached) {
        return cached
      }
    }

    const [data, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.contact.count({ where }),
    ])

    const result = { data: data as Contact[], total }

    // Cache the result
    if (isCacheable) {
      const cacheKey = buildCacheKey('contacts', 'list', 'page1')
      await cacheService.set(cacheKey, result, CACHE_TTL.MEDIUM)
    }

    return result
  }

  async findById(id: string): Promise<Contact | null> {
    const cacheKey = buildCacheKey('contacts', 'id', id)
    const cached = await cacheService.get<Contact>(cacheKey)
    if (cached) {
      return cached
    }

    const contact = await prisma.contact.findFirst({
      where: { id, deletedAt: null },
    })

    if (contact) {
      await cacheService.set(cacheKey, contact as Contact, CACHE_TTL.MEDIUM)
    }

    return contact as Contact | null
  }

  async create(data: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contact> {
    const contact = await prisma.contact.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        role: data.role,
        avatar: data.avatar,
        avatarColor: data.avatarColor,
        tags: data.tags,
        leadScore: data.leadScore,
        source: data.source,
        country: data.country,
        city: data.city,
        linkedin: data.linkedin,
        notes: data.notes,
        assigneeId: data.assigneeId,
        createdById: data.createdById,
      },
    })

    // Invalidate list cache
    await cacheService.deletePattern('contacts:list:*')

    return contact as Contact
  }

  async update(id: string, data: Partial<Contact>): Promise<Contact> {
    const contact = await prisma.contact.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    })

    // Invalidate caches
    await cacheService.delete(buildCacheKey('contacts', 'id', id))
    await cacheService.deletePattern('contacts:list:*')

    return contact as Contact
  }

  async delete(id: string): Promise<void> {
    await prisma.contact.update({
      where: { id },
      data: { deletedAt: new Date() },
    })

    // Invalidate caches
    await cacheService.delete(buildCacheKey('contacts', 'id', id))
    await cacheService.deletePattern('contacts:list:*')
  }
}

export const contactsRepository = new ContactsRepository()