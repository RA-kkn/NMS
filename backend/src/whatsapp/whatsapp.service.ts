import { Injectable, ServiceUnavailableException } from '@nestjs/common'
import { EventSeverity, EventSource, IncidentStatus, InterfaceStatus, NotificationStatus } from '@prisma/client'
import { PrismaService } from '../prisma.service'

@Injectable()
export class WhatsappService {
  constructor(private readonly prisma: PrismaService) {}

  async sendPortDown(interfaceId: string) {
    const networkInterface = await this.prisma.networkInterface.findUniqueOrThrow({
      where: { id: interfaceId },
      include: { device: true, client: true },
    })
    const recipients = await this.prisma.notificationRecipient.findMany({ where: { enabled: true, portDownEnabled: true } })
    const message = `PORT DOWN\nDevice: ${networkInterface.device.name}\nInterface: ${networkInterface.name}\nClient: ${networkInterface.client?.customerName ?? 'N/A'}\nIP: ${networkInterface.device.ipAddress}`
    await this.prisma.networkInterface.update({ where: { id: interfaceId }, data: { operationalStatus: InterfaceStatus.DOWN, lastChangeAt: new Date() } })
    const event = await this.prisma.event.create({
      data: {
        type: 'PORT_DOWN', source: EventSource.SYSLOG, severity: EventSeverity.CRITICAL,
        deviceId: networkInterface.deviceId, interfaceId, clientId: networkInterface.clientId,
        message, occurredAt: new Date(),
      },
    })
    await this.prisma.incident.create({ data: { eventType: 'PORT_DOWN', deviceId: networkInterface.deviceId, interfaceId, clientId: networkInterface.clientId, severity: EventSeverity.CRITICAL, status: IncidentStatus.ACTIVE, firstDownAt: new Date(), lastSeenAt: new Date(), updates: { create: { type: 'CREATED', message: 'Incident created from port-down notification test' } } } })
    const notifications = await Promise.all(recipients.map(async recipient => {
      const notification = await this.prisma.notification.create({ data: { eventId: event.id, recipientId: recipient.id, message, status: NotificationStatus.QUEUED } })
      try {
        const providerMessageId = await this.sendToMeta(recipient.phoneNumber, message)
        return this.prisma.notification.update({ where: { id: notification.id }, data: { status: NotificationStatus.SENT, providerMessageId, sentAt: new Date() } })
      } catch (error) {
        return this.prisma.notification.update({ where: { id: notification.id }, data: { status: NotificationStatus.FAILED, errorMessage: error instanceof Error ? error.message : 'WhatsApp provider failed', failedAt: new Date() } })
      }
    }))
    if (recipients.length === 0) throw new ServiceUnavailableException('No enabled WhatsApp recipients are configured')
    return { event, notifications }
  }

  private async sendToMeta(to: string, body: string) {
    const token = process.env.WHATSAPP_ACCESS_TOKEN
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
    const version = process.env.WHATSAPP_GRAPH_VERSION ?? 'v23.0'
    if (!token || !phoneNumberId) throw new Error('WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID are required')
    const response = await fetch(`https://graph.facebook.com/${version}/${phoneNumberId}/messages`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', recipient_type: 'individual', to, type: 'text', text: { preview_url: false, body } }),
    })
    const result = await response.json() as { messages?: { id?: string }[]; error?: { message?: string } }
    if (!response.ok) throw new Error(result.error?.message ?? `WhatsApp provider returned ${response.status}`)
    return result.messages?.[0]?.id ?? null
  }
}
