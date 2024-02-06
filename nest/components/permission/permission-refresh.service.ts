import { PermissionDescriptionEnum } from "@app/shared/endpoint/enum/endpoint-description.enum";
import {
  PERMISSION_REPOSITORY,
  IPermissionRepository,
} from "@app/entity/permission/interface/permission.repository.interface";
import { IEndPoint } from "@app/shared/endpoint/interface/endpoint.interface";
import { HttpResponse } from "@app/shared/response/model/http-response.model";
import { EndPointsService } from "@app/shared/endpoint/service/endpoint.service";
import { ICountResponse } from "@app/shared/response/interface/count-response.interface";
import { ResponseActionEnum } from "@app/shared/response/enum/response-action.enum";
import { Inject } from "@nestjs/common";
import { IPermission } from "@app/entity/permission/interface/permission.interface";

/**
 * This is the main mechanism through which permissions available in the system are created/deleted
 * - it checks the existing permissions against all the endpoints exposed by the system
 *   and creates/deletes permissions accordingly
 * - other services/controllers are made available but only for testing;
 *   the only controller that should be used to manage permissions is "/api/permission/refresh"
 */
export class PermissionRefreshService {
  public constructor(
    @Inject(PERMISSION_REPOSITORY) private readonly permissionRepository: IPermissionRepository,
    private readonly endPointService: EndPointsService,
  ) {}

  private async getCurrentPermissions(): Promise<IPermission[]> {
    return await this.permissionRepository.findAll();
  }

  private excludeParams(path: string): string {
    const paramsStartIndex: number = path.indexOf(":");
    if (paramsStartIndex > 0) path = path.substring(0, paramsStartIndex - 1);
    return path;
  }

  private getCurrentEndPoints(permissions: IPermission[]): Map<string, IEndPoint> {
    const currentEndPoints: Map<string, IEndPoint> = new Map();
    permissions.forEach((permission: IPermission): void => {
      let path: string = permission.path;
      const method: string = permission.method;

      currentEndPoints.set(path + "-" + method, {
        path: path,
        method: method,
        id: permission.id,
      });
    });

    return currentEndPoints;
  }

  private getAvailableEndPoints(): Map<string, IEndPoint> {
    const availableEndPoints: Map<string, IEndPoint> = new Map();
    this.endPointService.getAll().forEach((endPoint: IEndPoint): void => {
      endPoint.path = this.excludeParams(endPoint.path);
      let path: string = endPoint.path;
      const method: string = endPoint.method;

      const endPointKey: string = path + "-" + method;
      if (!availableEndPoints.has(endPointKey))
        availableEndPoints.set(path + "-" + method, endPoint);
    });

    return availableEndPoints;
  }

  private getMissingEndPoints(
    currentEndPoints: Map<string, IEndPoint>,
    availableEndPoints: Map<string, IEndPoint>,
  ): IEndPoint[] {
    const missingEndpoints: IEndPoint[] = [];
    for (const key of availableEndPoints.keys()) {
      const availableEndPoint: IEndPoint | undefined = availableEndPoints.get(key);
      if (!currentEndPoints.has(key) && availableEndPoint) missingEndpoints.push(availableEndPoint);
    }

    return missingEndpoints;
  }

  private getSurplusEndPoints(
    currentEndPoints: Map<string, IEndPoint>,
    availableEndPoints: Map<string, IEndPoint>,
  ): IEndPoint[] {
    const surPlusEndPoints: IEndPoint[] = [];
    for (const key of currentEndPoints.keys()) {
      const currentEndPoint: IEndPoint | undefined = currentEndPoints.get(key);
      if (!availableEndPoints.has(key) && currentEndPoint) surPlusEndPoints.push(currentEndPoint);
    }

    return surPlusEndPoints;
  }

  private buildPostRequests(endPoints: IEndPoint[]): Partial<IPermission>[] {
    const postRequests: Partial<IPermission>[] = [];
    endPoints.forEach((endPoint: IEndPoint): void => {
      let path: string = endPoint.path;
      const pathSplit: string[] = path.split("/");
      const module: string = pathSplit[2];
      const method: string = endPoint.method;
      const description: string = `${PermissionDescriptionEnum[method.toUpperCase()]} ${module}s`;

      postRequests.push({
        module: module,
        path: path,
        method: method,
        description: description,
      });
    });

    return postRequests;
  }

  private getIdPermissionsToDelete(endPoints: IEndPoint[]): string[] {
    const permissionIds: string[] = [];
    endPoints.forEach((endPoint: IEndPoint): void => {
      if (endPoint.id) permissionIds.push(endPoint.id);
    });

    return permissionIds;
  }

  private async createPermissions(requests: Partial<IPermission>[]): Promise<number> {
    if (requests.length === 0) return 0;

    return (await this.permissionRepository.createMany(requests)).length;
  }

  private async deletePermissions(ids: string[]): Promise<number> {
    if (ids.length === 0) return 0;

    return await this.permissionRepository.deleteMany(ids);
  }

  public async run(): Promise<HttpResponse<ICountResponse>> {
    const currentPermissions: IPermission[] = await this.getCurrentPermissions();

    const currentEndPoints: Map<string, IEndPoint> = this.getCurrentEndPoints(currentPermissions);
    const availableEndPoints: Map<string, IEndPoint> = this.getAvailableEndPoints();

    const missingEndpoints: IEndPoint[] = this.getMissingEndPoints(
      currentEndPoints,
      availableEndPoints,
    );

    const surPlusEndPoints: IEndPoint[] = this.getSurplusEndPoints(
      currentEndPoints,
      availableEndPoints,
    );

    const postRequests: Partial<IPermission>[] = this.buildPostRequests(missingEndpoints);
    const deleteIds: string[] = this.getIdPermissionsToDelete(surPlusEndPoints);

    const createdPermissions: number = await this.createPermissions(postRequests);
    const deletedPermissions: number = await this.deletePermissions(deleteIds);

    const response: number = createdPermissions + deletedPermissions;

    const message: string = response > 0 ? "entity.refresh" : "entity.no-action";

    return new HttpResponse<ICountResponse>({
      data: { records: response, action: ResponseActionEnum.MODIFIED },
      success: true,
      message: message,
    });
  }
}
