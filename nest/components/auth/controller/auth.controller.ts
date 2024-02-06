import { AuthDto } from "@app/shared/auth/dto/auth.dto";
import { IAuthResponse } from "@app/shared/auth/interface/auth-response.interface";
import { AuthService } from "@app/shared/auth/service/auth.service";
import { Public } from "@app/shared/decorators/public.decorator";
import { TokenRefresh } from "@app/shared/decorators/token-refresh.decorator";
import { GeneralResponseDocumentation } from "@app/shared/doc/generic.doc";
import { RefreshTokenGuard } from "@app/shared/guard/refresh-token.guard";
import { ICountResponse } from "@app/shared/response/interface/count-response.interface";
import { HttpResponse } from "@app/shared/response/model/http-response.model";
import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Request } from "express";

const controllerName: string = "auth";

@ApiTags(controllerName)
@Controller(controllerName)
export class AuthController {
  public constructor(private readonly authInService: AuthService) {}

  @Post("sign-in")
  @GeneralResponseDocumentation("Sign in")
  @Public()
  public signIn(
    @Body() signInDto: AuthDto,
    @Req() req: Request,
  ): Promise<HttpResponse<IAuthResponse>> {
    return this.authInService.signIn(signInDto, req);
  }

  @Get("refresh")
  @GeneralResponseDocumentation("Refresh tokens")
  @ApiBearerAuth()
  @TokenRefresh()
  @UseGuards(RefreshTokenGuard)
  public refreshTokens(@Req() req: Request): Promise<HttpResponse<IAuthResponse>> {
    return this.authInService.refreshToken(req);
  }

  @Get("log-out")
  @GeneralResponseDocumentation("Log out")
  @ApiBearerAuth()
  public logOut(@Req() req: Request): Promise<HttpResponse<ICountResponse>> {
    return this.authInService.logOut(req);
  }
}
