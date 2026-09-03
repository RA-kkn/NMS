import { Body, Controller, Post } from '@nestjs/common'
import { IsString, MinLength } from 'class-validator'
import { AuthService } from './auth.service'
class LoginDto { @IsString() username!: string; @IsString() @MinLength(8) password!: string }
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Post('login') async login(@Body() dto: LoginDto) { return { success: true, data: await this.auth.login(dto.username, dto.password) } }
}
