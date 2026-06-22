import { z } from 'zod'

export const createContactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  company: z.string().min(1, 'Company is required'),
  role: z.string().optional(),
  source: z.string().optional(),
  assigneeId: z.string().uuid().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  linkedin: z.string().url().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export const updateContactSchema = createContactSchema.partial()

export const contactQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  assigneeId: z.string().uuid().optional(),
})

export type CreateContactDTO = z.infer<typeof createContactSchema>
export type UpdateContactDTO = z.infer<typeof updateContactSchema>
export type ContactQueryDTO = z.infer<typeof contactQuerySchema>