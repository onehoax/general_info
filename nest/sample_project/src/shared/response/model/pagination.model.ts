import { ApiProperty } from "@nestjs/swagger";

export class Pagination {
  @ApiProperty()
  private readonly offset: number;

  @ApiProperty()
  private readonly limit: number;

  @ApiProperty()
  private readonly total: number;

  @ApiProperty()
  private readonly pageCount: number;

  @ApiProperty()
  private readonly previousPage: number;

  @ApiProperty()
  private readonly nextPage: number;

  public constructor(offset: number, limit: number, total: number) {
    this.offset = offset;
    this.limit = limit;
    this.total = total;
    this.pageCount = Math.ceil(this.total / this.limit);

    this.previousPage = this.offset > 0 ? this.offset - 1 : this.offset;
    this.nextPage = this.offset < this.pageCount - 1 ? this.offset + 1 : this.offset;
  }
}
