import { Pagination } from "@app/shared/response/model/pagination.model";
import { ApiProperty } from "@nestjs/swagger";

export class HttpResponse<T> {
  @ApiProperty({
    description: "Response data",
    example: "{ ... } | [ { ... } ]",
  })
  public readonly data!: T | T[];

  @ApiProperty({
    description: "Response success",
    example: "true",
  })
  public readonly success!: boolean;

  @ApiProperty({
    description: "Response message",
    example: "201: Resource Created",
  })
  public readonly message!: string;

  @ApiProperty({
    description: "Response pagination",
    example: "{ page: 1, take: 15, total: 20, pageCount: 2, previousPage: 1, nextPage: 2 }",
  })
  public readonly pagination?: Pagination;

  public constructor(httpResponse: HttpResponse<T>) {
    this.data = httpResponse.data;
    this.success = httpResponse.success;
    this.message = httpResponse.message;
    this.pagination = httpResponse.pagination;
  }
}
