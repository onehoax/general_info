import { UserModule } from "@app/entity/user/user.module";
import { BcryptModule } from "@app/shared/bcrypt/bcrypt.module";
import { JwtCustomService } from "@app/shared/jwt/service/jwt-custom.service";
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [JwtModule.register({}), UserModule, BcryptModule],
  providers: [JwtCustomService],
  exports: [JwtCustomService],
})
export class JwtCustomModule {}
