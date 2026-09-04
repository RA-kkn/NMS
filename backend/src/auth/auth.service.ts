import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../prisma.service'

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService) {}
  async login(username: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { username }, include: { roles: { include: { role: true } } } })
    if (!user || !user.enabled || !(await bcrypt.compare(password, user.passwordHash))) throw new HttpException({ success: false, message: 'Invalid username or password' }, HttpStatus.UNAUTHORIZED)
    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
    const role = user.roles.some(item => item.role.name === 'SUPER_ADMIN') ? 'SUPER_ADMIN' : user.roles[0]?.role.name ?? 'USER'
    const payload = { sub: user.id, username: user.username, role }
    return { accessToken: this.jwt.sign(payload), user: { id: user.id, username: user.username, role } }
  }
}
