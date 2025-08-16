import { Controller, Get, UseGuards } from '@nestjs/common';
import { MatchService } from '../services/match.service';
import { CurrentHttpUser } from '../../auth/decorators/current-http-user.decorator';
import { IUserJwtPayload } from '../../auth/models/user-jwt-payload.interface';
import { JwtHttpAuthGuard } from 'src/auth/guards/jwt-http-auth.guard';
import { ListMatchesResponseDto } from '../dtos/list-matches-response.dto';
import { MatchMapper } from '../mappers/match.mapper';

@Controller('matches')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @UseGuards(JwtHttpAuthGuard)
  @Get()
  async findAllMatchesByUser(
    @CurrentHttpUser() user: IUserJwtPayload,
  ): Promise<ListMatchesResponseDto []> {
    const matches = await this.matchService.findAllMatchesByUserId(user.sub);
    return MatchMapper.toListMatchesResponseDtos(matches);
  }
}
