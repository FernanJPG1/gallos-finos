import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Extrae el tenantId del request (inyectado por TenantMiddleware)
 * Uso: @TenantId() tenantId: string
 */
export const TenantId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenantId;
  },
);

/**
 * Extrae el schema del tenant del request
 * Uso: @TenantSchema() schema: string
 */
export const TenantSchema = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenantSchema;
  },
);
