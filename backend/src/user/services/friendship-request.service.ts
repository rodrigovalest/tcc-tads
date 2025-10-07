import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FriendshipRequest, FriendshipRequestStatus } from '../entities/friendship-request.entity';
import { Friendship } from '../entities/friendship.entity';
import { User } from '../entities/user.entity';
import { SendFriendshipRequestDto } from '../dtos/requests/send-friendship-request.dto';
import { RespondFriendshipRequestDto } from '../dtos/requests/respond-friendship-request.dto';
import { FriendshipRequestResponseDto } from '../dtos/responses/friendship-request-response.dto';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class FriendshipRequestService {
  constructor(
    @InjectRepository(FriendshipRequest)
    private readonly friendshipRequestRepository: Repository<FriendshipRequest>,
    @InjectRepository(Friendship)
    private readonly friendshipRepository: Repository<Friendship>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async sendFriendshipRequest(userId: number, dto: SendFriendshipRequestDto): Promise<FriendshipRequestResponseDto> {
    const addressee = await this.userRepository.findOne({
      where: { username: dto.username },
      relations: ['languages', 'interestTopics']
    });

    if (!addressee) {
      throw new NotFoundException('User not found');
    }

    if (addressee.id === userId) {
      throw new BadRequestException('Cannot send friendship request to yourself');
    }

    const existingRequest = await this.friendshipRequestRepository.findOne({
      where: [
        { requesterId: userId, addresseeId: addressee.id, status: FriendshipRequestStatus.PENDING },
        { requesterId: addressee.id, addresseeId: userId, status: FriendshipRequestStatus.PENDING }
      ]
    });

    if (existingRequest) {
      throw new BadRequestException('Friendship request already exists');
    }

    const existingFriendship = await this.friendshipRepository.findOne({
      where: [
        { userId, friendId: addressee.id },
        { userId: addressee.id, friendId: userId }
      ]
    });

    if (existingFriendship) {
      throw new BadRequestException('Users are already friends');
    }

    const requester = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['languages', 'interestTopics']
    });

    if (!requester) {
      throw new NotFoundException('Requester not found');
    }

    const friendshipRequest = new FriendshipRequest(userId, addressee.id);
    const savedRequest = await this.friendshipRequestRepository.save(friendshipRequest);

    return {
      id: savedRequest.id,
      requester: UserMapper.toResponseDto(requester),
      addressee: UserMapper.toResponseDto(addressee),
      status: savedRequest.status,
      createdAt: savedRequest.createdAt,
      updatedAt: savedRequest.updatedAt,
    };
  }

  async getReceivedRequests(userId: number): Promise<FriendshipRequestResponseDto[]> {
    const requests = await this.friendshipRequestRepository.find({
      where: { addresseeId: userId, status: FriendshipRequestStatus.PENDING },
      relations: ['requester', 'requester.languages', 'requester.interestTopics', 'addressee', 'addressee.languages', 'addressee.interestTopics'],
      order: { createdAt: 'DESC' }
    });

    return requests.map(request => ({
      id: request.id,
      requester: UserMapper.toResponseDto(request.requester),
      addressee: UserMapper.toResponseDto(request.addressee),
      status: request.status,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
    }));
  }

  async getSentRequests(userId: number): Promise<FriendshipRequestResponseDto[]> {
    const requests = await this.friendshipRequestRepository.find({
      where: { requesterId: userId, status: FriendshipRequestStatus.PENDING },
      relations: ['addressee', 'addressee.languages', 'addressee.interestTopics', 'requester', 'requester.languages', 'requester.interestTopics'],
      order: { createdAt: 'DESC' }
    });

    return requests.map(request => ({
      id: request.id,
      requester: UserMapper.toResponseDto(request.requester),
      addressee: UserMapper.toResponseDto(request.addressee),
      status: request.status,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
    }));
  }

  async respondToRequest(userId: number, requestId: number, dto: RespondFriendshipRequestDto): Promise<void> {
    const request = await this.friendshipRequestRepository.findOne({
      where: { id: requestId, addresseeId: userId, status: FriendshipRequestStatus.PENDING },
      relations: ['requester', 'addressee']
    });

    if (!request) {
      throw new NotFoundException('Friendship request not found');
    }

    if (dto.status === FriendshipRequestStatus.ACCEPTED) {
      const friendship1 = new Friendship(request.requesterId, request.addresseeId);
      const friendship2 = new Friendship(request.addresseeId, request.requesterId);
      
      await this.friendshipRepository.save([friendship1, friendship2]);
      await this.friendshipRequestRepository.remove(request);
    } else if (dto.status === FriendshipRequestStatus.REJECTED) {
      await this.friendshipRequestRepository.remove(request);
    }
  }

  async cancelRequest(userId: number, requestId: number): Promise<void> {
    const request = await this.friendshipRequestRepository.findOne({
      where: { id: requestId, requesterId: userId, status: FriendshipRequestStatus.PENDING }
    });

    if (!request) {
      throw new NotFoundException('Friendship request not found');
    }

    await this.friendshipRequestRepository.remove(request);
  }
}

