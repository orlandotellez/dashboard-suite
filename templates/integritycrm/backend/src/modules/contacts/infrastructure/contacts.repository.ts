import { prisma } from '../../../config/prisma.js'
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

    const [data, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.contact.count({ where }),
    ])

    return { data: data as Contact[], total }
  }

  async findById(id: string): Promise<Contact | null> {
    const contact = await prisma.contact.findFirst({
      where: { id, deletedAt: null },
    })

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

    return contact as Contact
  }

  async delete(id: string): Promise<void> {
    await prisma.contact.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  }
}

export const contactsRepository = new ContactsRepository()