import { PartialType } from '@nestjs/swagger';
import { CreateAdSpaceDto } from './create-ad-space.dto';

export class UpdateAdSpaceDto extends PartialType(CreateAdSpaceDto) {}
