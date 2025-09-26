import { Controller, Get, Post, Body, Param, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { MatchService } from '../services/match.service';
import { CurrentHttpUser } from '../../auth/decorators/current-http-user.decorator';
import { IUserJwtPayload } from '../../auth/models/user-jwt-payload.interface';
import { JwtHttpAuthGuard } from '../../auth/guards/jwt-http-auth.guard';
import { ListMatchesResponseDto } from '../dtos/list-matches-response.dto';
import { MatchMapper } from '../mappers/match.mapper';
import { MatchMode } from '../entities/match-mode.enum';
import { MatchLanguage } from '../entities/match-language.enum';

@Controller('matches')
export class MatchController {
  constructor(
    private readonly matchService: MatchService,
  ) {}

  @UseGuards(JwtHttpAuthGuard)
  @Get()
  async findAllMatchesByUser(
    @CurrentHttpUser() loggedUser: IUserJwtPayload,
  ): Promise<ListMatchesResponseDto[]> {
    const matchesWithScores = await this.matchService.findAllMatchesWithAverageScore(loggedUser.sub);
    return MatchMapper.toListMatchesResponseDtos(matchesWithScores);
  }

  @HttpCode(HttpStatus.CREATED) 
  @UseGuards(JwtHttpAuthGuard)
  @Post('solo')
  async createSoloMatch(
    @CurrentHttpUser() user: IUserJwtPayload,
    @Body() body: { mode: MatchMode; language: MatchLanguage },
  ) {
    const match = await this.matchService.createSoloMatch(
      body.mode,
      body.language,
      user.sub,
    );
    return { matchId: match.id };
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtHttpAuthGuard)
  @Post(':matchId/complete')
  async completeSoloMatch(@Param('matchId') matchId: string) {
    await this.matchService.completeSoloMatch(matchId);
    return { success: true };
  }
}
