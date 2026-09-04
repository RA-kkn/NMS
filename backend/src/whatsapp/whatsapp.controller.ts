import { Body, Controller, Post } from '@nestjs/common'
import { IsString } from 'class-validator'
import { WhatsappService } from './whatsapp.service'

class PortDownDto {
  @IsString()
  interfaceId!: string
}

@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsapp: WhatsappService) {}

  @Post('test-port-down')
  sendPortDown(@Body() dto: PortDownDto) {
    return this.whatsapp.sendPortDown(dto.interfaceId)
  }
}
