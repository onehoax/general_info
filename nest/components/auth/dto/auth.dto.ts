import { UserDto } from "@app/entity/user/dto/user.dto";
import { PickType } from "@nestjs/swagger";

export class AuthDto extends PickType(UserDto, ["userName", "password"] as const) {}
