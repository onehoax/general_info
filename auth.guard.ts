import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { Inject, Injectable } from "@nestjs/common";
import type { Request } from "express";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { LoggerService } from "@app/shared/infrastructure/logger/logger.service";
import { ExceptionsService } from "@app/shared/infrastructure/exceptions/exceptions.service";
import { ApplicationsProxyModule } from "@app/shared/infrastructure/applications-proxy/applications-proxy.module";
import { ApplicationsProxy } from "@app/shared/infrastructure/applications-proxy/applications-proxy";
import type { SignInService } from "@app/auth/signin/application/signin.service";
import { AuthRepository } from "@app/auth/shared/domain/auth.repository";
import type { JwtServicePayload } from "@app/shared/domain/jwt/jwt.interface";
import type { User } from "@app/user/domain/user.model";

@Injectable()
export class AuthGuard implements CanActivate {
  public constructor(
    private readonly exceptionService: ExceptionsService,
    private readonly logger: LoggerService,
    private readonly reflector: Reflector,
    @Inject(ApplicationsProxyModule.SIGN_IN_PROXY)
    private readonly userLoginService: ApplicationsProxy<SignInService>,
    @Inject(AuthRepository)
    private readonly authRepository: AuthRepository,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic: boolean = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request: Request = context.switchToHttp().getRequest();
    const token: string | null = this.extractTokenFromHeader(request);
    if (!token) {
      this.logger.warn(AuthGuard.name, "auth.no-token");
      throw this.exceptionService.unauthorizedException({
        message: "auth.no-token",
      });
    }

    const { id, username }: JwtServicePayload = await this.verifyToken(token);

    const user: User | null = await this.authRepository.getUserByIdAndToken(id, token);
    if (!user)
      throw this.exceptionService.unauthorizedException({
        message: "auth.unauthorized",
      });

    if (user.username.value !== username)
      this.exceptionService.unauthorizedException({
        message: "auth.unauthorized",
      });

    request.user = user.toPrimitives();
    return true;
  }

  private async verifyToken(token: string): Promise<JwtServicePayload> {
    try {
      return await this.userLoginService.getInstance().checkJwtToken(token);
    } catch (error) {
      this.logger.warn("JwtStrategy", "auth.token-invalid");
      throw this.exceptionService.unauthorizedException({
        message: "auth.token-invalid",
      });
    }
  }

  private extractTokenFromHeader(request: Request): string | null {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : null;
  }
}
