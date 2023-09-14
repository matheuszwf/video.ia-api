import { FastifyInstance } from 'fastify'
import fastifyMultipart from '@fastify/multipart'
import { randomUUID } from 'node:crypto'
import { pipeline } from 'node:stream'
import { promisify } from 'node:util'
import path from 'node:path'
import fs from 'node:fs'
import { prisma } from '../lib/prisma'

const pipe = promisify(pipeline)

export async function uploadAudio (app: FastifyInstance) {
  app.register(fastifyMultipart, {
    limits: {
      fileSize: 1024 * 1024 * 25 // 25MB
    }
  })

  app.post('/audio', async (request, reply) => {
    const data = await request.file()

    if (!data || data.file.bytesRead < 1024) {
      return reply.status(400).send({
        error: 'No file uploaded.'
      })
    }

    const extension = path.extname(data.filename)

    if (extension !== '.mp3') {
      return reply.status(400).send({
        error: 'Invalid file type, only .mp3 is allowed.'
      })
    }

    const fileBaseName = path.basename(data.filename, extension)
    const fileUploadName = `${fileBaseName}-${randomUUID()}${extension}`
    const uploadDestination = path.resolve(__dirname, '../../tmp', fileUploadName)

    await pipe(data.file, fs.createWriteStream(uploadDestination))

    const uploadedFile = await prisma.audio.create({
      data: {
        name: fileBaseName,
        path: uploadDestination
      }
    })

    return reply.status(200).send({
      uploadedFile
    })
  })
}
