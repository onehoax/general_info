import { GeneralResponseDocumentation } from "@app/shared/doc/generic.doc";
import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

const controllerName: string = "health";

@ApiTags(controllerName)
@Controller(controllerName)
export class HealthController {
  @Get()
  @GeneralResponseDocumentation("App Health")
  public run(): string {
    return "OK";
  }
}
