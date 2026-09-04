import { seedDemoData } from '../src/features/seed/services/seed-demo-data.service.ts'
import { prisma } from '../src/prisma/client.ts'

seedDemoData()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
