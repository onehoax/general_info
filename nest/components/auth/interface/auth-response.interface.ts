import { IUserResponse } from "@app/entity/user/interface/user-response.interface";
import { IJwtTokens } from "@app/shared/jwt/interface/jwt-tokens.interface";

export interface IAuthResponse {
  readonly tokens: IJwtTokens;
  readonly user: IUserResponse;
}
