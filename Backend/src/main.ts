import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule, ObserveInstrument } from './app.module.js';
import { SWAGGER_PATH } from './common/constants/app.constants.js';
import { BEARER_AUTH_NAME } from './common/constants/auth.constants.js';
import { AppConfigService } from './config/app-config.service.js';

function setupSwagger(app: NestExpressApplication): void {
  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Hustle API')
      .setDescription(
        'REST API for the Hustle mobile app. Protected endpoints require ' +
          '`Authorization: Bearer <access_token>`.',
      )
      .setVersion('1.0')
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, BEARER_AUTH_NAME)
      .build(),
  );
  SwaggerModule.setup(SWAGGER_PATH, app, document);
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    instrument: ObserveInstrument,
  });
  const { app: appConfig } = app.get(AppConfigService);

  if (appConfig.trustProxy) {
    app.set('trust proxy', 1);
  }
  app.disable('x-powered-by');
  app.use(helmet());
  app.enableCors({
    // Native mobile clients do not send an Origin header; only listed browser origins are allowed.
    origin: appConfig.corsOrigins.length > 0 ? appConfig.corsOrigins : false,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Authorization', 'Content-Type'],
  });
  app.enableShutdownHooks();

  if (!appConfig.isProduction) {
    setupSwagger(app);
  }

  await app.listen(appConfig.port);
}
await bootstrap();
