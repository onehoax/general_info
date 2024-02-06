import { IUser } from "@app/entity/user/interface/user.interface";
import { auth } from "@app/shared/constant/response-message.constant";
import { IS_PUBLIC_KEY } from "@app/shared/decorators/public.decorator";
import { IS_TOKEN_REFRESH_KEY } from "@app/shared/decorators/token-refresh.decorator";
import { IJwtPayload } from "@app/shared/jwt/interface/jwt-payload.interface";
import { JwtCustomService } from "@app/shared/jwt/service/jwt-custom.service";
import { LoggerService } from "@app/shared/logger/service/logger.service";
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";

@Injectable()
export class AccessTokenGuard implements CanActivate {
  public constructor(
    private readonly reflector: Reflector,
    private readonly jwtCustomService: JwtCustomService,
    private readonly loggerService: LoggerService,
  ) {}

  private log(message: string): void {
    this.loggerService.info({
      cls: this.constructor,
      data: {
        message: message,
      },
    });
  }

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic: boolean = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const publicMessage: string = `This endpoint is ${isPublic ? "" : "not"} public`;

    if (isPublic) {
      this.log(publicMessage);
      return true;
    }

    this.log(publicMessage);

    const isTokenRefresh: boolean = this.reflector.getAllAndOverride<boolean>(
      IS_TOKEN_REFRESH_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isTokenRefresh) {
      this.log("This is the token refresh endpoint: allowing access to refresh-token guard");
      return true;
    }

    const req: Request = context.switchToHttp().getRequest();
    const accessToken: string | undefined = req.get("Authorization")?.replace("Bearer", "").trim();

    if (!accessToken) {
      this.loggerService.error({
        cls: this.constructor,
        data: {
          message: `No access token in request`,
        },
      });

      throw new UnauthorizedException(auth.invalidToken);
    }

    const jwtPayload: IJwtPayload = await this.jwtCustomService.verifyAccessToken(accessToken);

    const user: IUser = await this.jwtCustomService.validateAccessTokenPayload(
      jwtPayload,
      AccessTokenGuard.name,
    );

    req.user = user;

    return true;
  }
}
