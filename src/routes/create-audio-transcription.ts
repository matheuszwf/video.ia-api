import { FastifyInstance } from "fastify"
import { z } from "zod"
import { prisma } from "../lib/prisma"
import { openai } from "../lib/openai"
import { createReadStream } from "fs"

export async function createAudioTranscriptionRoute(app: FastifyInstance) {
  app.post("/audio/:audioId/transcription", async (req) => {
    const paramsSchema = z.object({
      audioId: z.string().uuid(),
    });

    const { audioId } = paramsSchema.parse(req.params);

    const bodySchema = z.object({
      prompt: z.string(),
    });

    const { prompt } = bodySchema.parse(req.body);

    const audio = await prisma.audio.findUniqueOrThrow({
      where: {
        id: audioId,
      },
    });

    const audioReadStream = createReadStream(audio.path);

    const response = await openai.audio.transcriptions.create({
      file: audioReadStream,
      model: 'whisper-1',
      language: 'pt',
      response_format: 'json',
      temperature: 0,
      prompt
    });

    const transcription = response.text

    await prisma.audio.update({
      where: {
        id: audioId,
      },
      data: {
        transcription
      },
    });

    return { transcription }
  })
} 