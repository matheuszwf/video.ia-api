import { fastify } from 'fastify'
import { getAllPromptsRoute } from './routes/get-all-prompts'
import { uploadAudio } from './routes/upload-audio'
import { createAudioTranscriptionRoute } from './routes/create-audio-transcription'
import { generateIaCompletionRoute } from './routes/generate-ai-completion'
import { fastifyCors } from '@fastify/cors'

const app = fastify()
const routes = [
  getAllPromptsRoute,
  uploadAudio,
  createAudioTranscriptionRoute,
  generateIaCompletionRoute
]

routes.forEach((route) => {
  app.register(route)
})

app.register(fastifyCors, {
  origin: '*'
})

app.listen({
  port: 3333
}).then(() => {
  console.log("Server is running on 'http://localhost:3333'")
})
