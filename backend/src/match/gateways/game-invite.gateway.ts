import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayDisconnect,
  OnGatewayConnection,
  WebSocketServer,
} from '@nestjs/websockets';
import { UsePipes, UseFilters, Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { CurrentWsUser } from '../../auth/decorators/current-ws-user.decorator';
import { JwtWsAuthGuard } from '../../auth/guards/jwt-ws-auth.guard';
import { IUserJwtPayload } from '../../auth/models/user-jwt-payload.interface';
import { WsExceptionFilter } from '../../shared/filters/ws-exception.filter';
import { WsValidationPipe } from '../../shared/pipes/WsValidationPipe';
import { GameInviteService } from '../services/game-invite.service';
import { MatchMode } from '../entities/match-mode.enum';
import { MatchLanguage } from '../entities/match-language.enum';
import { OnEvent } from '@nestjs/event-emitter';
import { GameInvite } from '../entities/game-invite.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@UsePipes(new WsValidationPipe())
@UseFilters(new WsExceptionFilter())
@WebSocketGateway()
export class GameInviteGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(GameInviteGateway.name, {
    timestamp: true,
  });

  @WebSocketServer() server: Server;

  private userSocketMap = new Map<number, string>();

  constructor(
    private readonly gameInviteService: GameInviteService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('game-invite:send')
  async sendInvite(
    @CurrentWsUser() user: IUserJwtPayload,
    @MessageBody()
    payload: {
      inviteeId: number;
      matchMode: MatchMode;
      matchLanguage: MatchLanguage;
    },
    @ConnectedSocket() client: Socket,
  ) {
    this.userSocketMap.set(user.sub, client.id);

    try {
      const invite = await this.gameInviteService.createInvite(
        user.sub,
        payload.inviteeId,
        payload.matchMode,
        payload.matchLanguage,
      );

      const fullInvite = await this.gameInviteService.findById(invite.id);
      
      if (!fullInvite) {
        throw new Error('Invite not found after creation');
      }
      
      const inviteeSocketId = this.userSocketMap.get(payload.inviteeId);
      
      if (inviteeSocketId) {
        
        const inviteData = {
          invite: {
            id: fullInvite.id,
            matchMode: fullInvite.matchMode,
            matchLanguage: fullInvite.matchLanguage,
            inviter: {
              id: fullInvite.inviter.id,
              username: fullInvite.inviter.username,
              name: fullInvite.inviter.name || null,
              photo: fullInvite.inviter.photo || null,
            },
            status: fullInvite.status,
            createdAt: fullInvite.createdAt.toISOString(),
            expiresAt: fullInvite.expiresAt?.toISOString() || null,
          },
        };
        
        this.server.to(inviteeSocketId).emit('game-invite:received', inviteData);
        const socketExists = this.server.sockets.sockets.has(inviteeSocketId);
      } else {
        this.logger.warn(`❌❌❌ User ${payload.inviteeId} is NOT connected to GameInviteGateway (default namespace) ❌❌❌`);
        this.logger.warn(`Current connected users to GameInviteGateway: ${Array.from(this.userSocketMap.keys()).join(', ') || 'NONE'}`);
        this.logger.warn(`⚠️ User ${payload.inviteeId} may be connected to /chat namespace only. Invite will be sent when they connect to default namespace.`);
      }
      client.emit('game-invite:sent', {
        invite: {
          id: fullInvite.id,
          matchMode: fullInvite.matchMode,
          matchLanguage: fullInvite.matchLanguage,
          invitee: {
            id: fullInvite.invitee.id,
            username: fullInvite.invitee.username,
            name: fullInvite.invitee.name || null,
            photo: fullInvite.invitee.photo || null,
          },
          status: fullInvite.status,
          createdAt: fullInvite.createdAt.toISOString(),
          expiresAt: fullInvite.expiresAt?.toISOString() || null,
        },
      });

      return { success: true, inviteId: invite.id };
    } catch (error) {
      this.logger.error(`Error sending invite: ${error.message}`);
      throw error;
    }
  }

  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('game-invite:accept')
  async acceptInvite(
    @CurrentWsUser() user: IUserJwtPayload,
    @MessageBody() payload: { inviteId: number },
    @ConnectedSocket() client: Socket,
  ) {
    this.userSocketMap.set(user.sub, client.id);

    try {
      const invite = await this.gameInviteService.acceptInvite(
        payload.inviteId,
        user.sub,
      );

      const inviterSocketId = this.userSocketMap.get(invite.inviterId);
      if (inviterSocketId) {
        this.server.to(inviterSocketId).emit('game-invite:accepted', {
          inviteId: invite.id,
          matchMode: invite.matchMode,
          matchLanguage: invite.matchLanguage,
        });
      }

      client.emit('game-invite:accept-success', {
        inviteId: invite.id,
        matchMode: invite.matchMode,
        matchLanguage: invite.matchLanguage,
      });

      return { success: true, invite };
    } catch (error) {
      this.logger.error(`Error accepting invite: ${error.message}`);
      throw error;
    }
  }

  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('game-invite:reject')
  async rejectInvite(
    @CurrentWsUser() user: IUserJwtPayload,
    @MessageBody() payload: { inviteId: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const invite = await this.gameInviteService.rejectInvite(
        payload.inviteId,
        user.sub,
      );
      const inviterSocketId = this.userSocketMap.get(invite.inviterId);
      if (inviterSocketId) {
        this.server.to(inviterSocketId).emit('game-invite:rejected', {
          inviteId: invite.id,
        });
      }

      client.emit('game-invite:reject-success', {
        inviteId: invite.id,
      });

      return { success: true };
    } catch (error) {
      this.logger.error(`Error rejecting invite: ${error.message}`);
      throw error;
    }
  }

  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('game-invite:cancel')
  async cancelInvite(
    @CurrentWsUser() user: IUserJwtPayload,
    @MessageBody() payload: { inviteId: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const invite = await this.gameInviteService.findById(payload.inviteId);
      if (!invite) {
        throw new Error('Invite not found');
      }

      await this.gameInviteService.cancelInvite(payload.inviteId, user.sub);

      const inviteeSocketId = this.userSocketMap.get(invite.inviteeId);
      if (inviteeSocketId) {
        this.server.to(inviteeSocketId).emit('game-invite:cancelled', {
          inviteId: payload.inviteId,
        });
      }

      client.emit('game-invite:cancel-success', {
        inviteId: payload.inviteId,
      });

      return { success: true };
    } catch (error) {
      this.logger.error(`Error cancelling invite: ${error.message}`);
      throw error;
    }
  }

  @OnEvent('game-invite:created')
  handleInviteCreated(payload: { invite: GameInvite }) {
  }

  @OnEvent('game-invite:accepted')
  async handleInviteAccepted(payload: { invite: GameInvite }) {
    const inviterSocketId = this.userSocketMap.get(payload.invite.inviterId);
    const inviteeSocketId = this.userSocketMap.get(payload.invite.inviteeId);

    if (inviterSocketId && inviteeSocketId) {
      await this.gameInviteService.startDirectMatch(
        payload.invite.inviterId,
        payload.invite.inviteeId,
        payload.invite.matchMode,
        payload.invite.matchLanguage,
        inviterSocketId,
        inviteeSocketId,
      );
    }
  }

  async handleConnection(client: Socket, ...args: any[]) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization;
      if (!token) {
        this.logger.warn(`Connection attempt without token from socket ${client.id}`);
        return;
      }

      const [scheme, jwtToken] = token.split(' ');
      if (scheme !== 'Bearer' || !jwtToken) {
        this.logger.warn(`Invalid token format from socket ${client.id}`);
        return;
      }

      const payload = this.jwtService.verify(jwtToken, {
        secret: this.configService.get('JWT_SECRET'),
      }) as IUserJwtPayload;

      this.userSocketMap.set(payload.sub, client.id);
      try {
        const pendingInvites = await this.gameInviteService.getPendingInvites(payload.sub);
        if (pendingInvites.length > 0) {
          this.logger.log(`Sending ${pendingInvites.length} pending invites to user ${payload.sub} on connection`);
          pendingInvites.forEach((invite) => {
            const inviteData = {
              invite: {
                id: invite.id,
                matchMode: invite.matchMode,
                matchLanguage: invite.matchLanguage,
                inviter: {
                  id: invite.inviter.id,
                  username: invite.inviter.username,
                  name: invite.inviter.name || null,
                  photo: invite.inviter.photo || null,
                },
                status: invite.status,
                createdAt: invite.createdAt.toISOString(),
                expiresAt: invite.expiresAt?.toISOString() || null,
              },
            };
            client.emit('game-invite:received', inviteData);
            this.logger.log(`Sent pending invite ${invite.id} to user ${payload.sub} on connection`);
          });
        }
      } catch (error) {
        this.logger.error(`Error sending pending invites to user ${payload.sub}: ${error.message}`);
      }
    } catch (error) {
      this.logger.error(`Error authenticating connection: ${error.message}`);
    }
  }

  async handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.userSocketMap.entries()) {
      if (socketId === client.id) {
        this.userSocketMap.delete(userId);
        break;
      }
    }
  }
}

