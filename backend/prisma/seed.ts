import { PrismaClient, DeviceStatus, DeviceType, EventSeverity, EventSource, IncidentStatus } from '@prisma/client'
import * as bcrypt from 'bcrypt'
const prisma = new PrismaClient()

async function main() {
  const role = await prisma.role.upsert({ where: { name: 'SUPER_ADMIN' }, update: { description: 'Full access to the monitoring application' }, create: { name: 'SUPER_ADMIN', description: 'Full access to the monitoring application' } })
  const passwordHash = await bcrypt.hash('admin123', 12)
  const user = await prisma.user.upsert({ where: { username: 'admin' }, update: { passwordHash, enabled: true }, create: { name: 'Administrator', username: 'admin', email: 'admin@example.invalid', passwordHash } })
  await prisma.userRole.upsert({ where: { userId_roleId: { userId: user.id, roleId: role.id } }, update: {}, create: { userId: user.id, roleId: role.id } })
  const deviceData = [
    ['Core-SW-01', '10.10.10.1', 'Cisco', 'Switch', DeviceStatus.ONLINE], ['Core-SW-02', '10.10.10.2', 'Cisco', 'Switch', DeviceStatus.ONLINE], ['Access-SW-01', '10.10.20.1', 'Huawei', 'Switch', DeviceStatus.ONLINE], ['Access-SW-02', '10.10.20.2', 'Huawei', 'Switch', DeviceStatus.ONLINE], ['Access-SW-03', '10.10.20.3', 'MikroTik', 'Switch', DeviceStatus.OFFLINE], ['Edge-Router-01', '10.10.30.1', 'Cisco', 'Router', DeviceStatus.ONLINE],
  ] as const
  const created = []
  for (const [name, ipAddress, vendor, type, status] of deviceData) created.push(await prisma.device.upsert({ where: { ipAddress }, update: { status }, create: { name, ipAddress, vendor, type: type === 'Router' ? DeviceType.ROUTER : DeviceType.SWITCH, snmpVersion: 'v2c', status } }))
  const clientNames = ['ABC Telecom', 'XYZ Traders', 'City School', 'Mega Store', 'Alpha Solutions', 'Beta Internet User']
  for (let index = 0; index < clientNames.length; index++) await prisma.client.upsert({ where: { clientCode: `CL-${1001 + index}` }, update: {}, create: { clientCode: `CL-${1001 + index}`, customerName: clientNames[index], username: clientNames[index].toLowerCase().replaceAll(' ', '-'), packageName: `${20 + index * 10} Mbps` } })
  const iface = await prisma.networkInterface.upsert({ where: { deviceId_name: { deviceId: created[3].id, name: 'Gi0/12' } }, update: {}, create: { deviceId: created[3].id, name: 'Gi0/12', description: 'Customer ABC', speed: '1G', operationalStatus: 'DOWN', adminStatus: 'UP' } })
  const event = await prisma.event.create({ data: { type: 'PORT_DOWN', source: EventSource.SYSLOG, deviceId: created[3].id, interfaceId: iface.id, severity: EventSeverity.CRITICAL, message: 'Interface changed state to down', rawMessage: '%LINK-3-UPDOWN: Interface GigabitEthernet0/12, changed state to down', occurredAt: new Date() } })
  await prisma.incident.create({ data: { eventType: 'PORT_DOWN', deviceId: created[3].id, interfaceId: iface.id, severity: EventSeverity.CRITICAL, status: IncidentStatus.ACTIVE, firstDownAt: new Date(), lastSeenAt: new Date(), updates: { create: { type: 'CREATED', message: 'Incident created from demo port-down event' } } } })
  await prisma.notificationRecipient.upsert({ where: { id: 'demo-noc-recipient' }, update: {}, create: { id: 'demo-noc-recipient', name: 'NOC On-Call', phoneNumber: '+0000000000' } })
  await prisma.notificationPolicy.upsert({ where: { eventType: 'PORT_DOWN' }, update: {}, create: { eventType: 'PORT_DOWN', enabled: true, immediateNotification: true, reminderEnabled: true, reminderIntervalMinutes: 10, recoveryNotification: true, maxReminders: null } })
  console.log(`Seeded ${created.length} devices and event ${event.id}.`)
}
main().catch(error => { console.error(error); process.exitCode = 1 }).finally(() => prisma.$disconnect())
