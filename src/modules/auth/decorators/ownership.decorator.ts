// ownership.decorator.ts
import { SetMetadata } from '@nestjs/common';
export const Ownership = (model: string) =>
    SetMetadata('ownership_model', model);
