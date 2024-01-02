import { PermissionResponse } from "@app/permission/application/permission-response";
import { PermissionDescriptionEnum } from "@app/permission/domain/enum/permission-endpoint-description.enum";
import { PermissionId } from "@app/permission/domain/permission-id";
import { Permission } from "@app/permission/domain/permission.model";
import { PermissionPrimitive } from "@app/permission/domain/permission.primitive";
import { PermissionRepository } from "@app/permission/domain/permission.repository";
import { EndPoint } from "@app/shared/domain/interfaces/endpoint-interface";
import { HttpResponse } from "@app/shared/domain/response/http-response";
import { EndPointsService } from "@app/shared/infrastructure/endpoints/endpoints.service";
import { v4 as uuidv4 } from "uuid";

export class PermissionRefresh {
  public constructor(
    private readonly permissionRepository: PermissionRepository,
    private readonly endPointService: EndPointsService,
  ) {}

  private async getCurrentPermissions(): Promise<Permission[]> {
    return await this.permissionRepository.findAll();
  }

  private getCurrentEndPoints(permissions: Permission[]): Map<string, EndPoint> {
    const currentEndPoints: Map<string, EndPoint> = new Map();
    permissions.forEach((permission: Permission): void => {
      const path: string = permission.path.value;
      const method: string = permission.method.value;
      currentEndPoints.set(path + "-" + method, {
        path: path,
        method: method,
        id: permission.id.value,
      });
    });

    return currentEndPoints;
  }

  private getAvailableEndPoints(): Map<string, EndPoint> {
    const availableEndPoints: Map<string, EndPoint> = new Map();
    this.endPointService
      .getAll()
      .forEach(
        (endPoint: EndPoint): Map<string, EndPoint> =>
          availableEndPoints.set(endPoint.path + "-" + endPoint.method, endPoint),
      );

    return availableEndPoints;
  }

  private getMissingEndPoints(
    currentEndPoints: Map<string, EndPoint>,
    availableEndPoints: Map<string, EndPoint>,
  ): EndPoint[] {
    const missingEndpoints: EndPoint[] = [];
    for (const key of availableEndPoints.keys())
      if (!currentEndPoints.has(key)) missingEndpoints.push(availableEndPoints.get(key)!);

    return missingEndpoints;
  }

  private getSurplusEndPoints(
    currentEndPoints: Map<string, EndPoint>,
    availableEndPoints: Map<string, EndPoint>,
  ): EndPoint[] {
    const surPlusEndPoints: EndPoint[] = [];
    for (const key of currentEndPoints.keys())
      if (!availableEndPoints.has(key)) surPlusEndPoints.push(currentEndPoints.get(key)!);

    return surPlusEndPoints;
  }

  private buildPostRequests(endPoints: EndPoint[]): PermissionPrimitive[] {
    const postRequests: PermissionPrimitive[] = [];
    endPoints.forEach((endPoint: EndPoint): void => {
      const path: string = endPoint.path;
      const pathSplit: string[] = path.split("/");
      const module: string = pathSplit[2];
      const isSingleResource: boolean = pathSplit[pathSplit.length - 1].includes(":");
      const method: string = endPoint.method;
      const singleResource: string = ` a ${module}`;
      const manyResources: string = ` ${module}s`;
      const descriptionEnding: string = isSingleResource ? singleResource : manyResources;
      const description: string =
        PermissionDescriptionEnum[method.toUpperCase()] + descriptionEnding;
      postRequests.push({
        id: uuidv4(),
        module: module,
        path: path,
        method: method,
        description: description,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    return postRequests;
  }

  private getIdPermissionsToDelete(endPoints: EndPoint[]): string[] {
    const permissionIds: string[] = [];
    endPoints.forEach((endPoint: EndPoint): number => permissionIds.push(endPoint.id!));
    return permissionIds;
  }

  private async createPermissions(requests: PermissionPrimitive[]): Promise<PermissionPrimitive[]> {
    if (requests.length === 0) return [];

    const permissions: Permission[] = [];

    requests.forEach((request: PermissionPrimitive): void => {
      permissions.push(Permission.fromPrimitives(request));
    });

    await this.permissionRepository.createMany(permissions);

    return requests;
  }

  private async deletePermissions(ids: string[]): Promise<PermissionPrimitive[]> {
    if (ids.length === 0) return [];

    const permissionIds: PermissionId[] = [];

    ids.forEach((id: string): number => permissionIds.push(new PermissionId(id)));

    await this.permissionRepository.deleteMany(permissionIds);

    const deletedPermissions: Permission[] = await this.permissionRepository.findManyById(
      permissionIds,
      true,
    );

    return deletedPermissions.map((permission: Permission): PermissionPrimitive => {
      return permission.toPrimitives();
    });
  }

  public async run(): Promise<PermissionResponse> {
    const currentPermissions: Permission[] = await this.getCurrentPermissions();

    const currentEndPoints: Map<string, EndPoint> = this.getCurrentEndPoints(currentPermissions);
    const availableEndPoints: Map<string, EndPoint> = this.getAvailableEndPoints();

    const missingEndpoints: EndPoint[] = this.getMissingEndPoints(
      currentEndPoints,
      availableEndPoints,
    );

    const surPlusEndPoints: EndPoint[] = this.getSurplusEndPoints(
      currentEndPoints,
      availableEndPoints,
    );

    const postRequests: PermissionPrimitive[] = this.buildPostRequests(missingEndpoints);
    const deleteIds: string[] = this.getIdPermissionsToDelete(surPlusEndPoints);

    const createdPermissions: PermissionPrimitive[] = await this.createPermissions(postRequests);
    const deletedPermissions: PermissionPrimitive[] = await this.deletePermissions(deleteIds);

    const response: PermissionPrimitive[] = createdPermissions.concat(deletedPermissions);

    const message: string = response.length > 0 ? "entity.refresh" : "entity.no-action";

    return new HttpResponse<PermissionPrimitive[]>({
      data: response,
      success: true,
      message: message,
    });
  }
}
