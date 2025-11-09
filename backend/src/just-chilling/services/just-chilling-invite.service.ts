import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Friendship } from '../../user/entities/friendship.entity';
import { User } from '../../user/entities/user.entity';
import { MatchService } from '../../match/services/match.service';
import { MatchMode } from '../../match/entities/match-mode.enum';
import { MatchFormat } from '../../match/entities/match-format.enum';
import { MatchLanguage } from '../../match/entities/match-language.enum';
import { UserQueue } from '../../match/entities/user-queue.entity';
import { CountryCode } from '../../user/entities/country-code.enum';

interface PendingInvite {
  inviterId: number;
  inviterUsername: string;
  inviterNationality: CountryCode;
  inviterSocketId: string;
  invitedId: number;
  invitedUsername: string;
  invitedNationality: CountryCode;
  invitedSocketId: string;
  createdAt: Date;
  timeoutId: NodeJS.Timeout;
}

@Injectable()
export class JustChillingInviteService {
  private readonly logger = new Logger(JustChillingInviteService.name, { timestamp: true });
  private pendingInvites: Map<string, PendingInvite> = new Map();
  private readonly INVITE_TIMEOUT_MS = 60000;

  constructor(
    @InjectRepository(Friendship)
    private readonly friendshipRepository: Repository<Friendship>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly eventEmitter: EventEmitter2,
    private readonly matchService: MatchService,
  ) {}

  private getInviteKey(userId1: number, userId2: number): string {
    return [Math.min(userId1, userId2), Math.max(userId1, userId2)].join('-');
  }

  async sendInvite(
    inviterId: number,
    inviterUsername: string,
    inviterNationality: CountryCode,
    inviterSocketId: string,
    friendId: number,
  ): Promise<void> {
    this.logger.log(`User ${inviterId} is inviting user ${friendId} to Just Chilling`);
    const friendship = await this.friendshipRepository.findOne({
      where: [
        { userId: inviterId, friendId: friendId },
        { userId: friendId, friendId: inviterId },
      ],
    });

    if (!friendship) {
      throw new BadRequestException('Users are not friends');
    }

    const inviteKey = this.getInviteKey(inviterId, friendId);
    if (this.pendingInvites.has(inviteKey)) {
      throw new BadRequestException('There is already a pending invite between these users');
    }
    const invitedUser = await this.userRepository.findOne({
      where: { id: friendId },
      select: ['id', 'username', 'nationality'],
    });

    if (!invitedUser) {
      throw new BadRequestException('Friend not found');
    }
    const timeoutId = setTimeout(() => {
      this.handleInviteTimeout(inviteKey);
    }, this.INVITE_TIMEOUT_MS);
    const pendingInvite: PendingInvite = {
      inviterId,
      inviterUsername,
      inviterNationality,
      inviterSocketId,
      invitedId: friendId,
      invitedUsername: invitedUser.username,
      invitedNationality: invitedUser.nationality,
      invitedSocketId: '', 
      createdAt: new Date(),
      timeoutId,
    };

    this.pendingInvites.set(inviteKey, pendingInvite);
    this.eventEmitter.emit('just-chilling:invite-received', {
      inviterId,
      inviterUsername,
      inviterNationality,
      invitedId: friendId,
    });

    this.logger.log(`Invite sent from ${inviterId} to ${friendId}`);
  }

  async respondToInvite(
    invitedId: number,
    invitedUsername: string,
    invitedNationality: CountryCode,
    invitedSocketId: string,
    inviterId: number,
    accepted: boolean,
  ): Promise<void> {
    const inviteKey = this.getInviteKey(inviterId, invitedId);
    const pendingInvite = this.pendingInvites.get(inviteKey);

    if (!pendingInvite) {
      throw new BadRequestException('No pending invite found');
    }
    clearTimeout(pendingInvite.timeoutId);
    pendingInvite.invitedSocketId = invitedSocketId;

    if (accepted) {
      this.logger.log(`User ${invitedId} accepted invite from ${inviterId}`);
      const users: UserQueue[] = [
        new UserQueue(
          pendingInvite.inviterId,
          pendingInvite.inviterUsername,
          pendingInvite.inviterNationality,
          pendingInvite.inviterSocketId,
          MatchMode.JUST_CHILLING,
          MatchFormat.DUO,
          MatchLanguage.EN,
        ),
        new UserQueue(
          invitedId,
          invitedUsername,
          invitedNationality,
          invitedSocketId,
          MatchMode.JUST_CHILLING,
          MatchFormat.DUO,
          MatchLanguage.EN,
        ),
      ];

      const match = await this.matchService.createMatch(
        MatchMode.JUST_CHILLING,
        MatchFormat.DUO,
        MatchLanguage.EN,
        users,
      );
      this.eventEmitter.emit('just-chilling:duo:match-started', {
        user1: users[0],
        user2: users[1],
        language: MatchLanguage.EN,
        match,
      });
    } else {
      this.eventEmitter.emit('just-chilling:invite-declined', {
        inviterId: pendingInvite.inviterId,
        invitedId,
      });
    }
    this.pendingInvites.delete(inviteKey);
  }

  async cancelInvite(inviterId: number, friendId: number): Promise<void> {
    const inviteKey = this.getInviteKey(inviterId, friendId);
    const pendingInvite = this.pendingInvites.get(inviteKey);

    if (!pendingInvite) {
      throw new BadRequestException('No pending invite found');
    }

    if (pendingInvite.inviterId !== inviterId) {
      throw new BadRequestException('Only the inviter can cancel the invite');
    }
    clearTimeout(pendingInvite.timeoutId);
    this.eventEmitter.emit('just-chilling:invite-cancelled', {
      inviterId,
      invitedId: friendId,
    });
    this.pendingInvites.delete(inviteKey);
  }

  private handleInviteTimeout(inviteKey: string): void {
    const pendingInvite = this.pendingInvites.get(inviteKey);

    if (!pendingInvite) {
      return;
    }
    this.eventEmitter.emit('just-chilling:invite-timeout', {
      inviterId: pendingInvite.inviterId,
      invitedId: pendingInvite.invitedId,
    });
    this.pendingInvites.delete(inviteKey);
  }

  setInvitedSocketId(invitedId: number, socketId: string): void {
    for (const [key, invite] of this.pendingInvites.entries()) {
      if (invite.invitedId === invitedId && !invite.invitedSocketId) {
        invite.invitedSocketId = socketId;
        break;
      }
    }
  }

  hasPendingInvite(userId: number): boolean {
    for (const invite of this.pendingInvites.values()) {
      if (invite.inviterId === userId || invite.invitedId === userId) {
        return true;
      }
    }
    return false;
  }

  getPendingInviteForUser(userId: number): PendingInvite | null {
    for (const invite of this.pendingInvites.values()) {
      if (invite.invitedId === userId) {
        return invite;
      }
    }
    return null;
  }
}
