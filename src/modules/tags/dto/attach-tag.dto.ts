import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

export class AttachTagDto {
    @ApiProperty({ enum: ['post', 'project', 'vacancy'] })
    @IsIn(['post', 'project', 'vacancy'])
    entityType!: 'post' | 'project' | 'vacancy';

    @ApiProperty({ example: 'entity-id' })
    @IsString()
    entityId!: string;

    @ApiProperty({ example: 'tag-id' })
    @IsString()
    tagId!: string;
}
