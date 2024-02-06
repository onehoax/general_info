import { LoginLogModule } from "@app/entity/login-log/login-log.module";
import { UserModule } from "@app/entity/user/user.module";
import { AuthController } from "@app/shared/auth/controller/auth.controller";
import { AuthService } from "@app/shared/auth/service/auth.service";
import { BcryptModule } from "@app/shared/bcrypt/bcrypt.module";
import { JwtCustomModule } from "@app/shared/jwt/jwt-custom.module";
import { Module } from "@nestjs/common";

@Module({
  imports: [JwtCustomModule, UserModule, LoginLogModule, BcryptModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
