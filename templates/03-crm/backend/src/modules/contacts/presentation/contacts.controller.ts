import { FastifyRequest, FastifyReply } from 'fastify'
import { ContactsService } from '../application/contacts.service.js'
import { contactsRepository } from '../infrastructure/contacts.repository.js'
import {
  createContactSchema,
  updateContactSchema,
  contactQuerySchema,
  CreateContactDTO,
  UpdateContactDTO,
  ContactQueryDTO,
} from './contacts.dto.js'

const contactsService = new ContactsService({ contactsRepository })

export const contactsController = {
  async findAll(request: FastifyRequest, reply: FastifyReply) {
    const query = contactQuerySchema.parse(request.query)
    const user = request.user!

    const result = await contactsService.findAll({
      ...query,
      userId: user.id,
      role: user.role,
    })

    return reply.send({
      success: true,
      data: result.data,
      meta: {
        total: result.total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(result.total / query.limit),
      },
    })
  },

  async findById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params
    const user = request.user!

    const contact = await contactsService.findById(id, user.id, user.role)

    return reply.send({
      success: true,
      data: contact,
    })
  },

  async create(request: FastifyRequest, reply: FastifyReply) {
    const body = createContactSchema.parse(request.body) as CreateContactDTO
    const user = request.user!

    const contact = await contactsService.create({
      ...body,
      createdById: user.id,
    })

    return reply.status(201).send({
      success: true,
      data: contact,
    })
  },

  async update(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params
    const body = updateContactSchema.parse(request.body) as UpdateContactDTO
    const user = request.user!

    const contact = await contactsService.update(id, body, user.id, user.role)

    return reply.send({
      success: true,
      data: contact,
    })
  },

  async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params
    const user = request.user!

    await contactsService.delete(id, user.id, user.role)

    return reply.status(204).send()
  },
}