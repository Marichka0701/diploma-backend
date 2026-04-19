import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CreateFeedbackDto } from './dtos/requests/create-feedback.dto';
import { FeedbackService } from './feedback.service';

@Controller('feedbacks')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post('/')
  @UseGuards(AuthGuard)
  public async create(@Request() request, @Body() dto: CreateFeedbackDto) {
    const authorId = request.user.userId;
    return await this.feedbackService.create(authorId, dto);
  }

  @Get('/my')
  @UseGuards(AuthGuard)
  public async getMy(@Request() request) {
    return await this.feedbackService.getByAuthorId(request.user.userId);
  }

  @Get('/cleaner/:cleanerId/average')
  public async getCleanerAverage(
    @Param('cleanerId', ParseUUIDPipe) cleanerId: string,
  ) {
    return await this.feedbackService.getCleanerAverage(cleanerId);
  }

  @Get('/order/:orderId')
  @UseGuards(AuthGuard)
  public async getByOrder(@Param('orderId', ParseUUIDPipe) orderId: string) {
    return await this.feedbackService.getByOrderId(orderId);
  }

  @Get('/user/:userId')
  public async getByUser(@Param('userId', ParseUUIDPipe) userId: string) {
    return await this.feedbackService.getByRecipientId(userId);
  }
}
