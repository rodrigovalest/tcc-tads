import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameInvite, GameInviteStatus } from '../entities/game-invite.entity';
import { MatchMode } from '../entities/match-mode.enum';
import { MatchLanguage } from '../entities/match-language.enum';
import { FriendshipService } from '../../user/services/friendship.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserService } from '../../user/services/user.service';
import { CountryCode } from '../../user/entities/country-code.enum';

@Injectable()
export class GameInviteService {
  private readonly logger = new Logger(GameInviteService.name, {
    timestamp: true,
  });

  constructor(
    @InjectRepository(GameInvite)
    private readonly gameInviteRepository: Repository<GameInvite>,
    private readonly friendshipService: FriendshipService,
    private readonly eventEmitter: EventEmitter2,
    private readonly userService: UserService,
  ) {}

  async createInvite(
    inviterId: number,
    inviteeId: number,
    matchMode: MatchMode,
    matchLanguage: MatchLanguage,
  ): Promise<GameInvite> {
    const friends = await this.friendshipService.getFriends(inviterId);
    const isFriend = friends.some(
      (f) => f.friend.id === inviteeId || f.user.id === inviteeId,
    );

    if (!isFriend) {
      throw new BadRequestException('You can only invite friends');
    }
    const existingInvite = await this.gameInviteRepository.findOne({
      where: {
        inviterId,
        inviteeId,
        matchMode,
        status: GameInviteStatus.PENDING,
      },
    });

    if (existingInvite) {
      throw new BadRequestException('Invite already sent');
    }

    const invite = this.gameInviteRepository.create({
      inviterId,
      inviteeId,
      matchMode,
      matchLanguage,
    });

    const savedInvite = await this.gameInviteRepository.save(invite);
    const fullInvite = await this.findById(savedInvite.id);
    if (!fullInvite) {
      throw new Error('Failed to load invite after creation');
    }
    this.eventEmitter.emit('game-invite:created', {
      invite: fullInvite,
    });

    return fullInvite;
  }

  async acceptInvite(
    inviteId: number,
    inviteeId: number,
  ): Promise<GameInvite> {
    const invite = await this.gameInviteRepository.findOne({
      where: { id: inviteId, inviteeId },
      relations: ['inviter', 'invitee'],
    });

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    if (invite.status !== GameInviteStatus.PENDING) {
      throw new BadRequestException('Invite is not pending');
    }

    if (invite.expiresAt && invite.expiresAt < new Date()) {
      invite.status = GameInviteStatus.EXPIRED;
      await this.gameInviteRepository.save(invite);
      throw new BadRequestException('Invite has expired');
    }

    invite.status = GameInviteStatus.ACCEPTED;
    const savedInvite = await this.gameInviteRepository.save(invite);
    this.eventEmitter.emit('game-invite:accepted', {
      invite: savedInvite,
    });

    return savedInvite;
  }

  async rejectInvite(
    inviteId: number,
    inviteeId: number,
  ): Promise<GameInvite> {
    const invite = await this.gameInviteRepository.findOne({
      where: { id: inviteId, inviteeId },
    });

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    if (invite.status !== GameInviteStatus.PENDING) {
      throw new BadRequestException('Invite is not pending');
    }

    invite.status = GameInviteStatus.REJECTED;
    return await this.gameInviteRepository.save(invite);
  }

  async cancelInvite(
    inviteId: number,
    inviterId: number,
  ): Promise<void> {
    const invite = await this.gameInviteRepository.findOne({
      where: { id: inviteId, inviterId },
    });

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    if (invite.status !== GameInviteStatus.PENDING) {
      throw new BadRequestException('Invite is not pending');
    }

    invite.status = GameInviteStatus.CANCELLED;
    await this.gameInviteRepository.save(invite);
  }

  async getPendingInvites(userId: number): Promise<GameInvite[]> {
    return this.gameInviteRepository.find({
      where: {
        inviteeId: userId,
        status: GameInviteStatus.PENDING,
      },
      relations: ['inviter', 'invitee'],
      order: { createdAt: 'DESC' },
    });
  }

  async getSentInvites(userId: number): Promise<GameInvite[]> {
    return this.gameInviteRepository.find({
      where: {
        inviterId: userId,
        status: GameInviteStatus.PENDING,
      },
      relations: ['inviter', 'invitee'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(inviteId: number): Promise<GameInvite | null> {
    return this.gameInviteRepository.findOne({
      where: { id: inviteId },
      relations: ['inviter', 'invitee', 'inviter.languages', 'invitee.languages'],
    });
  }

  async cleanupExpiredInvites(): Promise<void> {
    const expiredInvites = await this.gameInviteRepository
      .createQueryBuilder('invite')
      .where('invite.status = :status', {
        status: GameInviteStatus.PENDING,
      })
      .andWhere('invite.expiresAt < :now', { now: new Date() })
      .getMany();

    if (expiredInvites.length > 0) {
      expiredInvites.forEach((invite) => {
        invite.status = GameInviteStatus.EXPIRED;
      });
      await this.gameInviteRepository.save(expiredInvites);
      this.logger.log(`Cleaned up ${expiredInvites.length} expired invites`);
    }
  }

  async startDirectMatch(
    inviterId: number,
    inviteeId: number,
    matchMode: MatchMode,
    matchLanguage: MatchLanguage,
    inviterSocketId: string,
    inviteeSocketId: string,
  ): Promise<void> {
    const inviter = await this.userService.findById(inviterId);
    const invitee = await this.userService.findById(inviteeId);

    if (!inviter || !invitee) {
      throw new NotFoundException('User not found');
    }
    this.eventEmitter.emit('game-invite:start-direct-match', {
      inviterId,
      inviteeId,
      inviterUsername: inviter.username,
      inviteeUsername: invitee.username,
      inviterNationality: inviter.nationality as CountryCode,
      inviteeNationality: invitee.nationality as CountryCode,
      inviterSocketId,
      inviteeSocketId,
      matchMode,
      matchLanguage,
    });
  }
}

