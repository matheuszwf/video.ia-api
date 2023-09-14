import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { openai } from '../lib/openai'
import { prisma } from '../lib/prisma'

export async function generateIaCompletionRoute (app: FastifyInstance) {
  app.post('/audio/:audioId/completion', async (req, reply) => {
    const paramsSchema = z.object({
      audioId: z.string().uuid()
    })

    const { audioId } = paramsSchema.parse(req.params)
    const bodySchema = z.object({
      prompt: z.string(),
      temperature: z.number().min(0).max(1).default(0.5)
    })

    const { prompt, temperature } = bodySchema.parse(req.body)
    const audio = await prisma.audio.findUniqueOrThrow({
      where: {
        id: audioId
      }
    })

    if (!audio.transcription) {
      return reply.status(400).send({
        error: 'Transcription was not generated yet.'
      })
    }

    const promptMessage = prompt.replace('{transcription}', audio.transcription)
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-16k',
      temperature,
      messages: [
        {
          role: 'user',
          content: promptMessage
        }
      ]
    })

    return { promptMessage, response }
  })
}
