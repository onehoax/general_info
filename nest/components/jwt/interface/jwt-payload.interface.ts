export interface IJwtPayload {
  readonly id: string;
  readonly userName: string;
}

export interface IJwtInfo extends IJwtPayload {
  readonly exp: number;
}
