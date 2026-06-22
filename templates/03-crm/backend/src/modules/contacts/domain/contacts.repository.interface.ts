import { Contact } from '../../../types/index.js'

export interface IContactsRepository {
  findAll(params: {
    page: number
    limit: number
    search?: string
    assigneeId?: string
  }): Promise<{ data: Contact[]; total: number }>
  findById(id: string): Promise<Contact | null>
  create(contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contact>
  update(id: string, data: Partial<Contact>): Promise<Contact>
  delete(id: string): Promise<void>
}