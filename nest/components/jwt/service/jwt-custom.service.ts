import { jwtConfig } from "@app/shared/env";
import { IJwtInfo, IJwtPayload } from "@app/shared/jwt/interface/jwt-payload.interface";
import { IJwtTokens } from "@app/shared/jwt/interface/jwt-tokens.interface";
import { LoggerService } from "@app/shared/logger/service/logger.service";
import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { JwtService, TokenExpiredError } from "@nestjs/jwt";
import { auth } from "@app/shared/constant/response-message.constant";
import {
  IUserRepository,
  USER_REPOSITORY,
} from "@app/entity/user/interface/user.repository.interface";
import { BcryptService } from "@app/shared/bcrypt/service/bcrypt.service";
import { reverseToken } from "@app/shared/jwt/jwt-custom.util";
import { IUser } from "@app/entity/user/interface/user.interface";

@Injectable()
export class JwtCustomService {
  public constructor(
    @Inject(jwtConfig.KEY)
    private readonly _jwtConfig: ConfigType<typeof jwtConfig>,
    private readonly jwtService: JwtService,
    private readonly bcryptService: BcryptService,
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    private readonly loggerService: LoggerService,
  ) {}

  private async tryTokenVerify(token: string, secret: string): Promise<IJwtPayload> {
    try {
      return await this.jwtService.verifyAsync(token, { secret: secret });
    } catch (err: unknown) {
      if (err instanceof TokenExpiredError) {
        this.loggerService.error({
          cls: this.constructor,
          data: {
            message: "JWT has expired",
          },
        });
      }
      throw new UnauthorizedException(auth.invalidToken);
    }
  }

  public async verifyAccessToken(token: string): Promise<IJwtPayload> {
    return this.tryTokenVerify(token, this._jwtConfig.accessTokenSecret);
  }

  public async verifyRefreshToken(token: string): Promise<IJwtPayload> {
    return this.tryTokenVerify(token, this._jwtConfig.refreshTokenSecret);
  }

  public decodeToken(token: string): IJwtInfo {
    return this.jwtService.decode(token);
  }

  public async getTokens(payload: IJwtPayload): Promise<IJwtTokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this._jwtConfig.accessTokenSecret,
        expiresIn: this._jwtConfig.accessTokenExpire,
      }),
      this.jwtService.signAsync(
        { id: payload.id },
        {
          secret: this._jwtConfig.refreshTokenSecret,
          expiresIn: this._jwtConfig.refreshTokenExpire,
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  public async getUserFromDb(userId: string, context: string): Promise<IUser> {
    const dbUser: IUser | null = await this.userRepository.findOne(userId);

    if (!dbUser) {
      this.loggerService.error({
        cls: context,
        data: {
          message: `No user in db with id: ${userId}`,
        },
      });

      throw new UnauthorizedException(auth.invalidToken);
    }

    return dbUser;
  }

  public async validateAccessTokenPayload(
    jwtPayload: IJwtPayload,
    context: string,
  ): Promise<IUser> {
    const dbUser: IUser = await this.getUserFromDb(jwtPayload.id, context);

    const isValid: boolean = jwtPayload.userName === dbUser.userName;

    if (!isValid) {
      this.loggerService.error({
        cls: context,
        data: {
          message: `Jwt payload.username doesn't match user with id: ${dbUser.id}`,
        },
      });

      throw new UnauthorizedException(auth.invalidToken);
    }

    return dbUser;
  }

  public async validateRefreshTokenPayload(
    jwtPayload: IJwtPayload,
    refreshToken: string,
    context: string,
  ): Promise<IUser> {
    const dbUser: IUser = await this.getUserFromDb(jwtPayload.id, context);

    if (!dbUser.refreshToken) {
      this.loggerService.error({
        cls: context,
        data: {
          message: `No Refresh token for user with id: ${dbUser.id}`,
        },
      });

      throw new UnauthorizedException(auth.invalidToken);
    }

    const isValid: boolean = await this.bcryptService.compare(
      reverseToken(refreshToken),
      dbUser.refreshToken,
    );

    if (!isValid) {
      this.loggerService.error({
        cls: context,
        data: {
          message: `Refresh token in request does not match refresh token in db for user with id: ${dbUser.id}`,
        },
      });

      throw new UnauthorizedException(auth.invalidToken);
    }

    return dbUser;
  }
}
