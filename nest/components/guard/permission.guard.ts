import { IPermission } from "@app/entity/permission/interface/permission.interface";
import { IRole } from "@app/entity/role/interface/role.interface";
import {
  IRoleRepository,
  ROLE_REPOSITORY,
} from "@app/entity/role/interface/role.repository.interface";
import { IUser } from "@app/entity/user/interface/user.interface";
import { auth } from "@app/shared/constant/response-message.constant";
import { IS_PUBLIC_KEY } from "@app/shared/decorators/public.decorator";
import { IS_TOKEN_REFRESH_KEY } from "@app/shared/decorators/token-refresh.decorator";
import { IEndPoint } from "@app/shared/endpoint/interface/endpoint.interface";
import { LoggerService } from "@app/shared/logger/service/logger.service";
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";

@Injectable()
export class PermissionGuard implements CanActivate {
  public constructor(
    @Inject(ROLE_REPOSITORY) private readonly roleRepository: IRoleRepository,
    private readonly reflector: Reflector,
    private readonly loggerService: LoggerService,
  ) {}

  private async getUserRole(id: string): Promise<IRole> {
    const role: IRole | null = await this.roleRepository.findOne(id);
    if (!role) throw new UnauthorizedException(auth.noRole);
    return role;
  }

  private getEndPoint(request: Request): IEndPoint {
    const { path, method, params }: Request = request;
    const paramValues: string[] = Object.values(params);
    const corePath: string = paramValues.reduce(
      (path: string, param: string): string => path.replace(`/${param}`, ""),
      path,
    );

    return { path: corePath, method: method.toLowerCase() };
  }

  private hasPermission(endPoint: IEndPoint, userPermissions: IPermission[]): boolean {
    if (userPermissions.length === 0) throw new UnauthorizedException(auth.noPermissions);

    return userPermissions.some(
      (permission: IPermission): boolean =>
        permission.path === endPoint.path && permission.method === endPoint.method,
    );
  }

  private isEndPointRolePermissionView(endPoint: IEndPoint): boolean {
    const BASE_PATH: string = "/api/";
    const ROLE_PATH: string = "role";
    const PERMISSION_PATH: string = "permission";
    const GET_METHOD: string = "get";
    const path: string = endPoint.path;
    const method: string = endPoint.method;
    return (
      (path === `${BASE_PATH}${ROLE_PATH}` || path === `${BASE_PATH}${PERMISSION_PATH}`) &&
      method === GET_METHOD
    );
  }

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic: boolean = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const isTokenRefresh: boolean = this.reflector.getAllAndOverride<boolean>(
      IS_TOKEN_REFRESH_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isTokenRefresh) return true;

    const req = context.switchToHttp().getRequest();

    const user: IUser = req.user;

    if (user.isSuperUser) return true;

    const role: IRole = await this.getUserRole(user.role.id);
    const endPoint: IEndPoint = this.getEndPoint(req);

    if (this.isEndPointRolePermissionView(endPoint)) return true;

    return this.hasPermission(endPoint, role.permissions);
  }
}
