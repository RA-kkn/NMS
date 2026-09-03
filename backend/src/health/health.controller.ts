import { Controller, Get } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}
  @Get()
  async check() {
    let database = 'disconnected'
    try { await this.prisma.$queryRaw`SELECT 1`; database = 'connected' } catch { database = 'unavailable' }
    return { success: true, data: { status: 'ok', timestamp: new Date().toISOString(), database } }
  }
}
