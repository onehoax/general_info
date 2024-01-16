import { AppModule } from "@app/app/app.module";
import { EnvironmentEnum } from "@inlaze_techlead/gannar-core";
import { INestApplication, Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from "@nestjs/swagger";
import * as cookieParser from "cookie-parser";

async function bootstrap(): Promise<void> {
  const app: INestApplication = await NestFactory.create(AppModule);
  const globalPrefix: string = "api";
  app.setGlobalPrefix(globalPrefix);
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  app.enableCors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  });

  app.use(cookieParser());

  const configService: ConfigService = app.get(ConfigService);
  const port: number = configService.get<number>("SERVER_PORT") ?? 3001;
  const env: EnvironmentEnum =
    configService.get<EnvironmentEnum>("NODE_ENV") ?? EnvironmentEnum.DEVELOPMENT;

  const config = new DocumentBuilder()
    .setTitle("Gannar Backoffice")
    .setDescription("Gannar Backoffice app documentation")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document: OpenAPIObject = SwaggerModule.createDocument(app, config);
  if (env !== EnvironmentEnum.PRODUCTION) {
    const swaggerPrefix: string = "docs";
    SwaggerModule.setup(swaggerPrefix, app, document);
    Logger.log(
      `Swagger docs is running on: http://localhost:${port}/${swaggerPrefix}`,
      bootstrap.name,
    );
  }

  await app.listen(port);
  Logger.log(`Application is running on http://localhost:${port}/${globalPrefix}`);
}

void bootstrap();
