import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { ErrorResponseDto } from '../common/dto/error-response.dto.js';
import type { AuthUser } from '../common/request-with-user.js';
import { AddFriendDto } from '../users/dto/add-friend.dto.js';
import { FriendDto } from '../users/dto/friend.dto.js';
import { FriendsService } from './friends.service.js';

@ApiTags('friends')
@ApiBearerAuth()
@Controller('users/me/friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Get()
  @ApiOperation({ summary: "List the current user's friends" })
  @ApiResponse({ status: 200, description: 'List of friends', type: [FriendDto] })
  @ApiResponse({
    status: 401,
    description: 'Missing or invalid access token',
    type: ErrorResponseDto,
  })
  list(@CurrentUser() user: AuthUser) {
    return this.friendsService.list(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Add a friend by user id' })
  @ApiResponse({ status: 201, description: 'Friend added', type: FriendDto })
  @ApiResponse({
    status: 400,
    description: 'Cannot add yourself as a friend',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Missing or invalid access token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Already friends',
    type: ErrorResponseDto,
  })
  add(@Body() dto: AddFriendDto, @CurrentUser() user: AuthUser) {
    return this.friendsService.add(user.id, dto);
  }

  @Delete(':friendId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove a friend' })
  @ApiResponse({ status: 204, description: 'Friend removed' })
  @ApiResponse({
    status: 401,
    description: 'Missing or invalid access token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Friendship not found',
    type: ErrorResponseDto,
  })
  async remove(
    @Param('friendId', ParseIntPipe) friendId: number,
    @CurrentUser() user: AuthUser,
  ) {
    await this.friendsService.remove(user.id, friendId);
  }
}
