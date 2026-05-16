import { IContactsRepository } from '../domain/contacts.repository.interface.js'
import { Contact } from '../../../types/index.js'
import { NotFoundError, BadRequestError } from '../../../core/errors/AppError.js'

export interface ContactsServiceDeps {
  contactsRepository: IContactsRepository
}

export class ContactsService {
  private contactsRepository: IContactsRepository

  constructor(deps: ContactsServiceDeps) {
    this.contactsRepository = deps.contactsRepository
  }

  async findAll(params: {
    page: number
    limit: number
    search?: string
    assigneeId?: string
    userId: string
    role: string
  }) {
    // RBAC: VENDEDOR only sees their own contacts
    if (params.role === 'VENDEDOR') {
      params.assigneeId = params.userId
    }

    return this.contactsRepository.findAll(params)
  }

  async findById(id: string, userId: string, role: string): Promise<Contact> {
    const contact = await this.contactsRepository.findById(id)

    if (!contact) {
      throw new NotFoundError('Contact not found')
    }

    // RBAC: VENDEDOR can only access their own contacts
    if (role === 'VENDEDOR' && contact.assigneeId !== userId) {
      throw new NotFoundError('Contact not found')
    }

    return contact
  }

  async create(data: {
    name: string
    email: string
    phone?: string
    company: string
    role?: string
    source?: string
    assigneeId?: string
    createdById: string
  }): Promise<Contact> {
    return this.contactsRepository.create({
      ...data,
      avatarColor: '#7C3AED',
      tags: [],
      leadScore: 0,
    })
  }

  async update(id: string, data: Partial<Contact>, userId: string, role: string): Promise<Contact> {
    const existing = await this.contactsRepository.findById(id)

    if (!existing) {
      throw new NotFoundError('Contact not found')
    }

    // RBAC: VENDEDOR can only update their own contacts
    if (role === 'VENDEDOR' && existing.assigneeId !== userId) {
      throw new NotFoundError('Contact not found')
    }

    return this.contactsRepository.update(id, data)
  }

  async delete(id: string, userId: string, role: string): Promise<void> {
    const existing = await this.contactsRepository.findById(id)

    if (!existing) {
      throw new NotFoundError('Contact not found')
    }

    // RBAC: VENDEDOR can only delete their own contacts
    if (role === 'VENDEDOR' && existing.assigneeId !== userId) {
      throw new NotFoundError('Contact not found')
    }

    return this.contactsRepository.delete(id)
  }
}