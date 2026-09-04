import { Module } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { WhatsappController } from './whatsapp.controller'
import { WhatsappService } from './whatsapp.service'

@Module({ controllers: [WhatsappController], providers: [WhatsappService, PrismaService] })
export class WhatsappModule {}
