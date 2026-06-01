import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

import { UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt/jwt.guard';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Post()
    create(@Body() dto: CreateUserDto) {
        return this.usersService.create(dto);
    }
	@ApiBearerAuth()
    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    @ApiBearerAuth()
    @Get('me')
    getMe(@Req() req) {
        const userId = req.user?.sub ?? req.user?.id ?? req.user?.userId;
        if (!userId) throw new UnauthorizedException();

        return this.usersService.getMe(userId);
    }

	@ApiBearerAuth()
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }
}
