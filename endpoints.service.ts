import { EndPoint } from "@app/shared/domain/interfaces/endpoint-interface";
import { Injectable } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";

@Injectable()
export class EndPointsService {
  public constructor(private adapterHost: HttpAdapterHost) {}

  public getAll(): EndPoint[] {
    const adapter = this.adapterHost.httpAdapter.getInstance();
    const stack = adapter._router.stack;

    const availableEndPoints: EndPoint[] = [];
    stack.forEach((element): void => {
      if (element.route)
        availableEndPoints.push({
          path: element.route.path,
          method: element.route.stack[0].method,
        });
    });

    const regex: RegExp = /\b(?:docs|auth|health|me|permission)\b/gi;
    const filteredEndPoints: EndPoint[] = availableEndPoints.filter(
      (route) => !route.path.match(regex),
    );

    return filteredEndPoints;
  }
}
