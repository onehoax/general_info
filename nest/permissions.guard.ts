import { PermissionId } from "@app/permission/domain/permission-id";
import { Permission } from "@app/permission/domain/permission.model";
import { PermissionPrimitive } from "@app/permission/domain/permission.primitive";
import { PermissionRepository } from "@app/permission/domain/permission.repository";
import { Role } from "@app/role/domain/role.model";
import { RolePrimitive } from "@app/role/domain/role.primitive";
import { RoleRepository } from "@app/role/domain/role.repository";
import { RoleId } from "@app/role/domain/value-object/role-id";
import { EndPoint } from "@app/shared/domain/interfaces/endpoint-interface";
import { IS_PUBLIC_KEY } from "@app/shared/infrastructure/decorators/public.decorator";
import { ExceptionsService } from "@app/shared/infrastructure/exceptions/exceptions.service";
import { LoggerService } from "@app/shared/infrastructure/logger/logger.service";
import { UserPrimitive } from "@app/user/domain/user.primitive";
import { CanActivate, ExecutionContext, Inject, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";

@Injectable()
export class PermissionGuard implements CanActivate {
  public constructor(
    @Inject(RoleRepository)
    private readonly roleRepository: RoleRepository,
    @Inject(PermissionRepository)
    private readonly permissionRepository: PermissionRepository,
    private readonly reflector: Reflector,
    private readonly exceptionRepository: ExceptionsService,
    private readonly logger: LoggerService,
  ) {}

  private async getRolePermissions(ids: string[]): Promise<PermissionPrimitive[]> {
    const permissionIds: PermissionId[] = ids.map(
      (id: string): PermissionId => new PermissionId(id),
    );
    const permissions: Permission[] = await this.permissionRepository.findManyById(permissionIds);

    return permissions.map(
      (permission: Permission): PermissionPrimitive => permission.toPrimitives(),
    );
  }

  private async getUserRole(id: string): Promise<RolePrimitive> {
    const roleId: RoleId = new RoleId(id);
    const role: Role | null = await this.roleRepository.findById(roleId);
    if (!role) throw this.exceptionRepository.unauthorizedException({ message: "auth.no-role" });
    return role.toPrimitives();
  }

  private getEndPoint(request: Request): EndPoint {
    const { path, method, params }: Request = request;
    const paramValues: string[] = Object.values(params);
    const corePath: string = paramValues.reduce(
      (path: string, param: string): string => path.replace(`/${param}`, ""),
      path,
    );

    return { path: corePath, method: method.toLowerCase() };
  }

  private hasPermission(endPoint: EndPoint, userPermissions: PermissionPrimitive[]): boolean {
    if (userPermissions.length === 0)
      this.exceptionRepository.unauthorizedException({ message: "auth.no-permissions" });

    return userPermissions.some(
      (permission: PermissionPrimitive): boolean =>
        permission.path === endPoint.path && permission.method === endPoint.method,
    );
  }

  private isEndPointRolePermissionView(endPoint: EndPoint): boolean {
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

    const request = context.switchToHttp().getRequest();
    const user: UserPrimitive = request.user;

    if (user.isSuperUser) return true;

    const role: RolePrimitive = await this.getUserRole(user.role);
    const permissions: PermissionPrimitive[] = await this.getRolePermissions(role.permissions);
    const endPoint: EndPoint = this.getEndPoint(request);

    if (this.isEndPointRolePermissionView(endPoint)) return true;

    return this.hasPermission(endPoint, permissions);
  }
}
