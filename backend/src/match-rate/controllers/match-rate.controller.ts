import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { MatchRateService } from '../services/match-rate.service';
import { CreateMatchRateRequestDto } from '../dtos/create-match-rate-request.dto';
import { IUserJwtPayload } from '../../auth/models/user-jwt-payload.interface';
import { CurrentHttpUser } from '../../auth/decorators/current-http-user.decorator';
import { JwtHttpAuthGuard } from '../../auth/guards/jwt-http-auth.guard';

@Controller('match-rate')
export class MatchRateController {
  constructor(private readonly matchRateService: MatchRateService) {}

  @HttpCode(HttpStatus.CREATED) 
  @UseGuards(JwtHttpAuthGuard)
  @Post()
  async create(
    @Body() body: CreateMatchRateRequestDto,
    @CurrentHttpUser() loggedUser: IUserJwtPayload,
  ): Promise<void> {
    await this.matchRateService.createMatchRate(
      body.matchId,
      loggedUser.sub,
      body.reviewedId,
      body.fluencyScore,
    );
  }
}
