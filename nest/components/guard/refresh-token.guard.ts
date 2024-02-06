import { IUser } from "@app/entity/user/interface/user.interface";
import { auth } from "@app/shared/constant/response-message.constant";
import { IJwtPayload } from "@app/shared/jwt/interface/jwt-payload.interface";
import { JwtCustomService } from "@app/shared/jwt/service/jwt-custom.service";
import { LoggerService } from "@app/shared/logger/service/logger.service";
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  public constructor(
    private readonly jwtCustomService: JwtCustomService,
    private readonly loggerService: LoggerService,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const refreshToken: string | undefined = req.get("Authorization")?.replace("Bearer", "").trim();

    if (!refreshToken) {
      this.loggerService.error({
        cls: this.constructor,
        data: {
          message: `No access token in request`,
        },
      });

      throw new UnauthorizedException(auth.invalidToken);
    }

    const jwtPayload: IJwtPayload = await this.jwtCustomService.verifyRefreshToken(refreshToken);

    const user: IUser = await this.jwtCustomService.validateRefreshTokenPayload(
      jwtPayload,
      refreshToken,
      RefreshTokenGuard.name,
    );

    req.user = user;

    return true;
  }
}
