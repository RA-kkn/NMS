import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
import { IsBoolean, IsEnum, IsIP, IsInt, IsOptional, IsString, Min } from 'class-validator'
import { DeviceType, InterfaceStatus } from '@prisma/client'
import { PrismaService } from '../prisma.service'

class DeviceDto { @IsString() name!: string; @IsIP() ipAddress!: string; @IsString() vendor!: string; @IsOptional() @IsString() model?: string; @IsEnum(DeviceType) type!: DeviceType; @IsOptional() @IsString() location?: string; @IsString() snmpVersion!: string; @IsOptional() @IsInt() @Min(1) snmpPort?: number; @IsOptional() @IsBoolean() enabled?: boolean }
class ClientDto { @IsString() clientCode!: string; @IsString() customerName!: string; @IsOptional() @IsString() username?: string; @IsOptional() @IsString() serviceType?: string; @IsOptional() @IsString() packageName?: string; @IsOptional() @IsString() phoneNumber?: string; @IsOptional() @IsString() notes?: string }
class InterfaceDto { @IsString() deviceId!: string; @IsString() name!: string; @IsOptional() @IsString() description?: string; @IsOptional() @IsString() clientId?: string; @IsOptional() @IsString() speed?: string; @IsOptional() @IsEnum(InterfaceStatus) adminStatus?: InterfaceStatus; @IsOptional() @IsEnum(InterfaceStatus) operationalStatus?: InterfaceStatus }
const ok = <T>(data: T) => ({ success: true, data })

@Controller()
export class DataController {
  constructor(private readonly prisma: PrismaService) {}
  @Get('devices') async devices() { return ok(await this.prisma.device.findMany({ orderBy: { name: 'asc' } })) }
  @Get('devices/:id') async device(@Param('id') id: string) { return ok(await this.prisma.device.findUniqueOrThrow({ where: { id }, include: { interfaces: true } })) }
  @Post('devices') async createDevice(@Body() dto: DeviceDto) { return ok(await this.prisma.device.create({ data: dto })) }
  @Patch('devices/:id') async updateDevice(@Param('id') id: string, @Body() dto: Partial<DeviceDto>) { return ok(await this.prisma.device.update({ where: { id }, data: dto })) }
  @Delete('devices/:id') async deleteDevice(@Param('id') id: string) { await this.prisma.device.delete({ where: { id } }); return ok({ id }) }
  @Get('interfaces') async interfaces() { return ok(await this.prisma.networkInterface.findMany({ include: { device: true, client: true } })) }
  @Get('interfaces/:id') async networkInterface(@Param('id') id: string) { return ok(await this.prisma.networkInterface.findUniqueOrThrow({ where: { id }, include: { device: true, client: true } })) }
  @Post('interfaces') async createInterface(@Body() dto: InterfaceDto) { return ok(await this.prisma.networkInterface.create({ data: dto })) }
  @Patch('interfaces/:id') async updateInterface(@Param('id') id: string, @Body() dto: Partial<InterfaceDto>) { return ok(await this.prisma.networkInterface.update({ where: { id }, data: dto })) }
  @Get('clients') async clients() { return ok(await this.prisma.client.findMany({ include: { interfaces: true } })) }
  @Get('clients/:id') async client(@Param('id') id: string) { return ok(await this.prisma.client.findUniqueOrThrow({ where: { id }, include: { interfaces: true } })) }
  @Post('clients') async createClient(@Body() dto: ClientDto) { return ok(await this.prisma.client.create({ data: dto })) }
  @Patch('clients/:id') async updateClient(@Param('id') id: string, @Body() dto: Partial<ClientDto>) { return ok(await this.prisma.client.update({ where: { id }, data: dto })) }
  @Get('alerts') async alerts() { return ok(await this.prisma.event.findMany({ where: { severity: { in: ['CRITICAL', 'WARNING'] } }, orderBy: { occurredAt: 'desc' } })) }
  @Get('alerts/:id') async alert(@Param('id') id: string) { return ok(await this.prisma.event.findUniqueOrThrow({ where: { id } })) }
  @Patch('alerts/:id/acknowledge') async acknowledge(@Param('id') id: string) { return ok(await this.prisma.incident.updateMany({ where: { id }, data: { status: 'ACKNOWLEDGED' } })) }
  @Get('incidents') async incidents() { return ok(await this.prisma.incident.findMany({ orderBy: { createdAt: 'desc' } })) }
  @Get('events') async events() { return ok(await this.prisma.event.findMany({ orderBy: { occurredAt: 'desc' } })) }
  @Get('syslog') async syslog() { return ok(await this.prisma.syslogMessage.findMany({ orderBy: { receivedAt: 'desc' } })) }
  @Get('snmp/checks') async snmp() { return ok(await this.prisma.snmpCheck.findMany({ orderBy: { checkedAt: 'desc' } })) }
  @Get('notifications') async notifications() { return ok(await this.prisma.notification.findMany({ orderBy: { createdAt: 'desc' } })) }
  @Get('recipients') async recipients() { return ok(await this.prisma.notificationRecipient.findMany()) }
  @Post('recipients') async createRecipient(@Body() body: { name: string; phoneNumber: string }) { return ok(await this.prisma.notificationRecipient.create({ data: body })) }
  @Patch('recipients/:id') async updateRecipient(@Param('id') id: string, @Body() body: { name?: string; phoneNumber?: string; enabled?: boolean }) { return ok(await this.prisma.notificationRecipient.update({ where: { id }, data: body })) }
  @Delete('recipients/:id') async deleteRecipient(@Param('id') id: string) { await this.prisma.notificationRecipient.delete({ where: { id } }); return ok({ id }) }
  @Get('noc/actions') async nocActions() { return ok(await this.prisma.nocAction.findMany({ orderBy: { createdAt: 'desc' } })) }
  @Get('noc/package-changes') async packageChanges() { return ok(await this.prisma.packageChange.findMany({ orderBy: { createdAt: 'desc' } })) }
  @Get('audit-logs') async auditLogs() { return ok(await this.prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' } })) }
  @Get('settings') async settings() { return ok(await this.prisma.systemSetting.findMany()) }
  @Patch('settings/:key') async updateSetting(@Param('key') key: string, @Body() body: { value: string }) { return ok(await this.prisma.systemSetting.upsert({ where: { key }, update: { value: body.value }, create: { key, value: body.value } })) }
  @Get('users') async users() { return ok(await this.prisma.user.findMany({ select: { id: true, name: true, username: true, email: true, enabled: true, lastLoginAt: true, createdAt: true, roles: { include: { role: true } } } })) }
  @Get('roles') async roles() { return ok(await this.prisma.role.findMany({ include: { permissions: true } })) }
}
