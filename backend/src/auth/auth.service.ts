import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../prisma.service'

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService) {}
  async login(username: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { username }, include: { roles: { include: { role: true } } } })
    if (!user || !user.enabled || !(await bcrypt.compare(password, user.passwordHash))) throw new UnauthorizedException('Invalid username or password')
    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
    const payload = { sub: user.id, username: user.username, roles: user.roles.map(item => item.role.name) }
    return { accessToken: this.jwt.sign(payload), user: { id: user.id, name: user.name, username: user.username, roles: payload.roles } }
  }
}
