import 'reflect-metadata'
import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import helmet from 'helmet'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173'
  app.use(helmet())
  app.enableCors({ origin: frontendUrl, credentials: true })
  app.setGlobalPrefix('api')
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  const swaggerConfig = new DocumentBuilder().setTitle('ISP Monitor API').setDescription('Backend foundation for the ISP NOC monitoring system').setVersion('1.0').addBearerAuth().build()
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, swaggerConfig))
  await app.listen(Number(process.env.PORT ?? 3000))
}
bootstrap()
