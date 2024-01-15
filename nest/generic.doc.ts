import { HttpMessageEnum } from "@app/shared/response/enum/http-messsage.enum";
import { HttpResponse } from "@app/shared/response/model/http-response.model";
import { HttpStatusCode } from "@inlaze_techlead/gannar-core";
import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";

/**
 * Generic swagger controller doc generators
 * - Generates description and most responses
 * - Specify properties containing types (e.g.: ApiBody)
 *   on the controllers themselves to specify corresponding types
 */
export const GeneralResponseDocumentation = (description: string): PropertyDecorator => {
  return applyDecorators(
    ApiOperation({
      summary: description,
      description: description,
    }),
    ApiResponse({
      status: HttpStatusCode.Ok,
      description: HttpMessageEnum.OK,
      type: HttpResponse,
    }),
    ApiResponse({
      status: HttpStatusCode.BadRequest,
      description: HttpMessageEnum.BAD_REQUEST,
    }),
  );
};

export const GenericFindByIdDocumentation = (entity: string): PropertyDecorator => {
  const description: string = `Get ${entity}(s) by id(s)`;
  const baseError: string = `Could not find ${entity}(s)`;
  return applyDecorators(
    ApiOperation({
      summary: description,
      description: description,
    }),
    ApiResponse({
      status: HttpStatusCode.Found,
      description: HttpMessageEnum.FOUND,
      type: HttpResponse,
    }),
    ApiResponse({
      status: HttpStatusCode.NotFound,
      description: `${baseError} - ${HttpMessageEnum.NOT_FOUND}`,
    }),
    ApiResponse({
      status: HttpStatusCode.BadRequest,
      description: `${baseError} - ${HttpMessageEnum.BAD_REQUEST}`,
    }),
  );
};

export const GenericFindAllDocumentation = (entity: string): PropertyDecorator => {
  const description: string = `Get all ${entity}(s)`;
  const baseError: string = `Could not find ${entity}(s)`;
  return applyDecorators(
    ApiOperation({
      summary: description,
      description: description,
    }),
    ApiResponse({
      status: HttpStatusCode.Found,
      description: HttpMessageEnum.FOUND,
      type: HttpResponse,
    }),
    ApiResponse({
      status: HttpStatusCode.NotFound,
      description: `${baseError} - ${HttpMessageEnum.NOT_FOUND}`,
    }),
    ApiResponse({
      status: HttpStatusCode.BadRequest,
      description: `${baseError} - ${HttpMessageEnum.BAD_REQUEST}`,
    }),
  );
};

export const GenericCreateDocumentation = (entity: string): PropertyDecorator => {
  const description: string = `Create ${entity}(s)`;
  const baseError: string = `Could not create ${entity}(s)`;
  return applyDecorators(
    ApiOperation({
      summary: description,
      description: description,
    }),
    ApiResponse({
      status: HttpStatusCode.Created,
      description: HttpMessageEnum.CREATED,
      type: HttpResponse,
    }),
    ApiResponse({
      status: HttpStatusCode.BadRequest,
      description: `${baseError} - ${HttpMessageEnum.BAD_REQUEST}`,
    }),
    ApiResponse({
      status: HttpStatusCode.Conflict,
      description: `${baseError} - ${HttpMessageEnum.CONFLICT}`,
    }),
  );
};

export const GenericUpdateDocumentation = (entity: string): PropertyDecorator => {
  const description: string = `Update ${entity}(s)`;
  const baseError: string = `Could not update ${entity}(s)`;
  return applyDecorators(
    ApiOperation({
      summary: description,
      description: description,
    }),
    ApiResponse({
      status: HttpStatusCode.Ok,
      description: HttpMessageEnum.UPDATED,
      type: Number,
    }),
    ApiResponse({
      status: HttpStatusCode.BadRequest,
      description: `${baseError} - ${HttpMessageEnum.BAD_REQUEST}`,
    }),
    ApiResponse({
      status: HttpStatusCode.NotFound,
      description: `${baseError} - ${HttpMessageEnum.NOT_FOUND}`,
    }),
    ApiResponse({
      status: HttpStatusCode.Conflict,
      description: `${baseError} - ${HttpMessageEnum.CONFLICT}`,
    }),
  );
};

export const GenericDeleteDocumentation = (entity: string): PropertyDecorator => {
  const description: string = `Delete ${entity}(s) by id(s)`;
  const baseError: string = `Could not delete ${entity}(s)`;
  return applyDecorators(
    ApiOperation({
      summary: description,
      description: description,
    }),
    ApiResponse({
      status: HttpStatusCode.Ok,
      description: HttpMessageEnum.DELETED,
      type: Number,
    }),
    ApiResponse({
      status: HttpStatusCode.NotFound,
      description: `${baseError} - ${HttpMessageEnum.NOT_FOUND}`,
    }),
    ApiResponse({
      status: HttpStatusCode.BadRequest,
      description: `${baseError} - ${HttpMessageEnum.BAD_REQUEST}`,
    }),
  );
};
