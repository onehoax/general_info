import { HttpMessageEnum } from "@app/shared/response/enum/http-messsage.enum";
import { HttpResponse } from "@app/shared/response/model/http-response.model";
import { HttpStatus, applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";

/**
 * Generic swagger controller doc generators
 * - Generates description and most responses
 * - Specify properties containing types (e.g.: ApiBody)
 *   on the controllers themselves to specify corresponding types
 */
export const GeneralResponseDocumentation = (
  description: string,
): PropertyDecorator => {
  return applyDecorators(
    ApiOperation({
      summary: description,
      description: description,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: HttpMessageEnum.OK,
      type: HttpResponse,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: HttpMessageEnum.BAD_REQUEST,
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: HttpMessageEnum.UNAUTHORIZED,
    }),
  );
};

export const GenericFindByIdDocumentation = (
  entity: string,
): PropertyDecorator => {
  const description: string = `Get ${entity}(s) by id(s)`;
  const baseError: string = `Could not find ${entity}(s)`;
  return applyDecorators(
    ApiOperation({
      summary: description,
      description: description,
    }),
    ApiResponse({
      status: HttpStatus.FOUND,
      description: HttpMessageEnum.FOUND,
      type: HttpResponse,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: `${baseError} - ${HttpMessageEnum.NOT_FOUND}`,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: `${baseError} - ${HttpMessageEnum.BAD_REQUEST}`,
    }),
  );
};

export const GenericFindAllDocumentation = (
  entity: string,
): PropertyDecorator => {
  const description: string = `Get all ${entity}(s)`;
  const baseError: string = `Could not find ${entity}(s)`;
  return applyDecorators(
    ApiOperation({
      summary: description,
      description: description,
    }),
    ApiResponse({
      status: HttpStatus.FOUND,
      description: HttpMessageEnum.FOUND,
      type: HttpResponse,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: `${baseError} - ${HttpMessageEnum.NOT_FOUND}`,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: `${baseError} - ${HttpMessageEnum.BAD_REQUEST}`,
    }),
  );
};

export const GenericCreateDocumentation = (
  entity: string,
): PropertyDecorator => {
  const description: string = `Create ${entity}(s)`;
  const baseError: string = `Could not create ${entity}(s)`;
  return applyDecorators(
    ApiOperation({
      summary: description,
      description: description,
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: HttpMessageEnum.CREATED,
      type: HttpResponse,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: `${baseError} - ${HttpMessageEnum.BAD_REQUEST}`,
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: `${baseError} - ${HttpMessageEnum.CONFLICT}`,
    }),
  );
};

export const GenericUpdateDocumentation = (
  entity: string,
): PropertyDecorator => {
  const description: string = `Update ${entity}(s)`;
  const baseError: string = `Could not update ${entity}(s)`;
  return applyDecorators(
    ApiOperation({
      summary: description,
      description: description,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: HttpMessageEnum.UPDATED,
      type: Number,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: `${baseError} - ${HttpMessageEnum.BAD_REQUEST}`,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: `${baseError} - ${HttpMessageEnum.NOT_FOUND}`,
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: `${baseError} - ${HttpMessageEnum.CONFLICT}`,
    }),
  );
};

export const GenericDeleteDocumentation = (
  entity: string,
): PropertyDecorator => {
  const description: string = `Delete ${entity}(s) by id(s)`;
  const baseError: string = `Could not delete ${entity}(s)`;
  return applyDecorators(
    ApiOperation({
      summary: description,
      description: description,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: HttpMessageEnum.DELETED,
      type: Number,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: `${baseError} - ${HttpMessageEnum.NOT_FOUND}`,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: `${baseError} - ${HttpMessageEnum.BAD_REQUEST}`,
    }),
  );
};
