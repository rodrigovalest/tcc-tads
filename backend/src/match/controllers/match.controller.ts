import { Controller, Get, Post, Body, Param, UseGuards, HttpStatus, HttpCode, Query } from '@nestjs/common';
import { MatchService } from '../services/match.service';
import { CurrentHttpUser } from '../../auth/decorators/current-http-user.decorator';
import { IUserJwtPayload } from '../../auth/models/user-jwt-payload.interface';
import { JwtHttpAuthGuard } from '../../auth/guards/jwt-http-auth.guard';
import { ListMatchesResponseDto } from '../dtos/list-matches-response.dto';
import { MatchMapper } from '../mappers/match.mapper';
import { MatchMode } from '../entities/match-mode.enum';
import { MatchLanguage } from '../entities/match-language.enum';
import { MatchesPaginationQueryDto } from '../dtos/matches-pagination-query.dto';

@Controller('matches')
export class MatchController {
  constructor(
    private readonly matchService: MatchService,
  ) {}

  @UseGuards(JwtHttpAuthGuard)
  @Get()
  async findAllMatchesByUser(
    @CurrentHttpUser() loggedUser: IUserJwtPayload,
    @Query() query: MatchesPaginationQueryDto,
  ): Promise<{
    data: ListMatchesResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const result = await this.matchService.findAllMatchesWithAverageScore(
      loggedUser.sub,
      query.page,
      query.limit,
    );

    return {
      data: MatchMapper.toListMatchesResponseDtos(result.data),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
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
