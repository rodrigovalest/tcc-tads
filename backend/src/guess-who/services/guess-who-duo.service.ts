import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MatchService } from '../../match/services/match.service';
import { QueueService } from '../../match/services/queue.service';
import { IUserJwtPayload } from '../../auth/models/user-jwt-payload.interface';
import { MatchFormat } from '../../match/entities/match-format.enum';
import { MatchLanguage } from '../../match/entities/match-language.enum';
import { MatchMode } from '../../match/entities/match-mode.enum';
import { Match } from '../../match/entities/match.entity';
import { UserQueue } from '../../match/entities/user-queue.entity';
import { UserService } from '../../user/services/user.service';
import { GUESS_WHO_CHARACTERS } from '../constants/guess-who-characters';
import { IGuessWhoMatchRepository } from '../repositories/guess-who-match.interface';
import { GuessWhoMatch } from '../entities/guess-who-match.entity';
import { GUESS_WHO_QUESTIONING_DURATION_MS, GUESS_WHO_GUESSING_OR_MARKING_DURATION_MS } from '../constants/guess-who-duration';
import { GuessWhoStatus } from '../entities/guess-who-status.enum';
import { GuessWhoStage } from '../entities/guess-who-stage.enum';
import { GuessWhoCharacter } from '../entities/guess-who-character.entity';

@Injectable()
export class GuessWhoDuoService {
  constructor(
    private readonly userService: UserService,
    private readonly queueService: QueueService,
    private readonly eventEmitter: EventEmitter2,
    private readonly matchService: MatchService,
    @Inject('IGuessWhoMatchRepository')
    private readonly guessWhoMatchRepository: IGuessWhoMatchRepository
  ) {}

  private readonly logger = new Logger(GuessWhoDuoService.name, {
    timestamp: true,
  });

  async enqueueDuoFormatAndTryStart(
    user: IUserJwtPayload,
    socketId: string,
    language: MatchLanguage,
  ): Promise<void> {
    this.logger.log(`[enqueue][request] userId=${user.sub} socketId=${socketId} lang=${language} | enqueue requested`);

    await this.queueService.enqueue(
      user.sub,
      user.username,
      user.nationality,
      socketId,
      MatchMode.GUESS_WHO,
      MatchFormat.DUO,
      language,
    );

    const queueSize = await this.queueService.getQueueSize(
      MatchMode.GUESS_WHO,
      MatchFormat.DUO,
      language,
    );

    if (queueSize >= 2) {
      const usersQueue: UserQueue[] = await this.queueService.dequeueUsers(
        MatchMode.GUESS_WHO,
        MatchFormat.DUO,
        language,
        2,
      );

      const user1 = await this.userService.findById(usersQueue[0].userId);
      const user2 = await this.userService.findById(usersQueue[1].userId);

      const match: Match = await this.matchService.createMatch(
        MatchMode.GUESS_WHO,
        MatchFormat.DUO,
        language,
        usersQueue,
      );

      this.logger.log(`[match-start] matchId=${match.id} users=${usersQueue.map(u => u.userId).join(',')} | match created`);

      this.eventEmitter.emit('guess-who:duo:match-started', {
        userQueue1: usersQueue[0],
        userQueue2: usersQueue[1],
        user1PhotoUri: user1!.photo ?? null,
        user2PhotoUri: user2!.photo ?? null,
        language: language,
        match,
      });

      const shuffled = this.shuffle([...GUESS_WHO_CHARACTERS]);
      const characters = shuffled.slice(0, 16);
      const characterUser1 = this.pickRandom(characters);
      const characterUser2 = this.pickRandom(characters);

      this.guessWhoMatchRepository.create(
        match.id,
        usersQueue[0].userId,
        usersQueue[1].userId,
        usersQueue[0].socketId,
        usersQueue[1].socketId,
        characters,
        characterUser1,
        characterUser2,
        usersQueue[0].userId
      );

      this.eventEmitter.emit('guess-who:duo:characters-selected', {
        userQueue1: usersQueue[0],
        userQueue2: usersQueue[1],
        characters,
        characterUser1,
        characterUser2,
        matchId: match.id
      });

      this.roundStart(usersQueue[0].socketId, usersQueue[1].socketId, match.id);
    }
  }

  async roundStart(
    userSocketId1: string,
    userSocketId2: string,
    matchId: string,
  ) {
    this.logger.log(`[round-start] matchId=${matchId} turnSocket=${userSocketId1} otherSocket=${userSocketId2} | round initiated`);

    const now = new Date();
    const end = new Date(now.getTime() + GUESS_WHO_QUESTIONING_DURATION_MS);

    this.eventEmitter.emit('guess-who:duo:round-start', {
      userSocketId: userSocketId1,
      status: GuessWhoStatus.QUESTIONING,
      message: 'make a yes or no question trying to guess your character',
      startTime: now,
      endTime: end,
      matchId
    });

    this.eventEmitter.emit('guess-who:duo:round-start', {
      userSocketId: userSocketId2,
      status: GuessWhoStatus.ANSWERING,
      message: 'answer with yes or no the question that your buddy is doing',
      startTime: now,
      endTime: end,
      matchId
    });

    // -------------------------------------------------------
    // TIMEOUT AUTOMÁTICO SE NINGUÉM PERGUNTAR OU RESPONDER
    // -------------------------------------------------------
    setTimeout(async () => {
      const match = await this.guessWhoMatchRepository.findByMatchId(matchId);
      if (!match) return;

      if (match.stage !== GuessWhoStage.QUESTIONING) {
        return;
      }

      this.logger.warn(`[round-timeout] matchId=${matchId} oldTurn=${match.userIdTurn}`);

      const newTurnUserId =
        match.userIdTurn === match.user1Id
          ? match.user2Id
          : match.user1Id;

      match.userIdTurn = newTurnUserId;
      match.stage = GuessWhoStage.QUESTIONING;

      await this.guessWhoMatchRepository.update(matchId, match);

      const newTurnSocket =
        newTurnUserId === match.user1Id
          ? match.user1SocketId
          : match.user2SocketId;

      const otherSocket =
        newTurnUserId === match.user1Id
          ? match.user2SocketId
          : match.user1SocketId;

      this.roundStart(newTurnSocket, otherSocket, matchId);
    }, GUESS_WHO_QUESTIONING_DURATION_MS);
  }

  async handleAnswer(
    matchId: string,
    answer: boolean,
  ) {
    const guessWhoMatch = await this.guessWhoMatchRepository.findByMatchId(matchId);

    if (!guessWhoMatch) {
      this.logger.warn(`[answer][match-not-found] matchId=${matchId}`);
      return;
    }

    if (guessWhoMatch.stage !== GuessWhoStage.QUESTIONING) {
      this.logger.warn(`[answer][invalid-stage] matchId=${matchId} stage=${guessWhoMatch.stage}`);
      return;
    }

    this.logger.log(`[answer][process] matchId=${matchId} stage=${guessWhoMatch.stage} answer=${answer}`);

    const {
      user1Id,
      user2Id,
      user1SocketId,
      user2SocketId,
      userIdTurn
    } = guessWhoMatch;

    const turnSocketId =
      userIdTurn === user1Id ? user1SocketId : user2SocketId;

    const otherSocketId =
      userIdTurn === user1Id ? user2SocketId : user1SocketId;

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + GUESS_WHO_GUESSING_OR_MARKING_DURATION_MS);

    this.eventEmitter.emit('guess-who:duo:guessing-or-unmarking', {
      socketId: turnSocketId,
      message: "your buddy has answered",
      answer,
      timestamp: new Date().toISOString(),
      status: GuessWhoStatus.GUESSING_OR_UNMARKING,
      startTime,
      endTime,
      matchId: guessWhoMatch.matchId
    });

    this.eventEmitter.emit('guess-who:duo:waiting', {
      socketId: otherSocketId,
      message: "wait for your buddy to guess or unmark",
      timestamp: new Date().toISOString(),
      status: GuessWhoStatus.WAITING,
      startTime,
      endTime,
      matchId
    });

    guessWhoMatch.stage = GuessWhoStage.GUESSING_OR_UNMARKING;
    await this.guessWhoMatchRepository.update(matchId, guessWhoMatch);

    // -------------------------------------------------------
    // TIMEOUT AUTOMÁTICO SE O USUARIO NÃO CHUTAR
    // -------------------------------------------------------
    setTimeout(async () => {
      const fresh = await this.guessWhoMatchRepository.findByMatchId(matchId);
      if (!fresh) return;

      if (fresh.stage !== GuessWhoStage.GUESSING_OR_UNMARKING) {
        return;
      }

      this.logger.warn(`[guessing-timeout] matchId=${matchId} prevTurn=${fresh.userIdTurn}`);

      const newTurnUserId =
        fresh.userIdTurn === fresh.user1Id ? fresh.user2Id : fresh.user1Id;

      fresh.userIdTurn = newTurnUserId;
      fresh.stage = GuessWhoStage.QUESTIONING;
      await this.guessWhoMatchRepository.update(matchId, fresh);

      const newTurnSocket =
        newTurnUserId === fresh.user1Id ? fresh.user1SocketId : fresh.user2SocketId;

      const otherSocket =
        newTurnUserId === fresh.user1Id ? fresh.user2SocketId : fresh.user1SocketId;

      this.roundStart(newTurnSocket, otherSocket, matchId);
    }, GUESS_WHO_GUESSING_OR_MARKING_DURATION_MS);
  }

  async handleGuess(
    matchId: string,
    guessingUserId: number,
    guessCharacter: GuessWhoCharacter,
  ) {
    const match = await this.guessWhoMatchRepository.findByMatchId(matchId);

    if (!match) {
      this.logger.warn(`[guess][match-not-found] matchId=${matchId}`);
      return;
    }

    if (match.stage !== GuessWhoStage.GUESSING_OR_UNMARKING) {
      this.logger.warn(`[guess][invalid-stage] matchId=${matchId} stage=${match.stage}`);
      return;
    }

    this.logger.log(`[guess][process] matchId=${matchId} userId=${guessingUserId} guessId=${guessCharacter.id}`);

    // Identificação dos dois usuários
    const isUser1Guessing = guessingUserId === match.user1Id;
    const guessingUserSocket = isUser1Guessing ? match.user1SocketId : match.user2SocketId;
    const otherUserSocket = isUser1Guessing ? match.user2SocketId : match.user1SocketId;

    // Descobre quem deveria ser acertado
    const correctCharacterId = isUser1Guessing
      ? match.user2Character.id
      : match.user1Character.id;

    const isCorrectGuess = guessCharacter.id === correctCharacterId;

    // Atualiza fase do jogo
    match.stage = GuessWhoStage.RESULT;
    await this.guessWhoMatchRepository.update(matchId, match);

    // ============================================================
    //                      ACERTOU
    // ============================================================
    if (isCorrectGuess) {
      this.logger.log(`[guess][correct] matchId=${matchId} userId=${guessingUserId} | correct guess`);

      this.eventEmitter.emit("guess-who:duo:win", {
        socketId: guessingUserSocket,
        status: GuessWhoStatus.WIN,
        message: "correct guess! you won the match",
        timestamp: new Date().toISOString(),
        matchId: match.matchId
      });

      const losingCharacter =
        isUser1Guessing ? match.user1Character : match.user2Character;

      this.eventEmitter.emit("guess-who:duo:lose", {
        socketId: otherUserSocket,
        status: GuessWhoStatus.LOSE,
        message: "your buddy guessed correctly. you lost this match",
        buddyCharacter: losingCharacter,
        timestamp: new Date().toISOString(),
        matchId: match.matchId
      });

      this.guessWhoMatchRepository.deleteById(matchId);

      return;
    }

    // ============================================================
    //                      ERROU
    // ============================================================

    this.logger.log(`[guess][correct] matchId=${matchId} userId=${guessingUserId} | incorrect guess`);

    this.eventEmitter.emit("guess-who:duo:wrong-guess", {
      socketId: guessingUserSocket,
      status: GuessWhoStatus.WRONG_GUESS,
      message: "incorrect guess",
      guessCharacter: guessCharacter,
      timestamp: new Date().toISOString(),
      matchId: match.matchId
    });

    this.eventEmitter.emit("guess-who:duo:wrong-guess", {
      socketId: otherUserSocket,
      status: GuessWhoStatus.BUDDY_WRONG_GUESS,
      message: "your buddy guessed incorrectly",
      guessCharacter: guessCharacter,
      timestamp: new Date().toISOString(),
      matchId: match.matchId
    });

    // ============================================================
    //                RECOMEÇA A PRÓXIMA RODADA
    // ============================================================

    const now = new Date();
    const end = new Date(now.getTime() + GUESS_WHO_QUESTIONING_DURATION_MS);

    match.stage = GuessWhoStage.QUESTIONING;
    match.userIdTurn = guessingUserId === match.user1Id ? match.user2Id : match.user1Id;
    await this.guessWhoMatchRepository.update(matchId, match);

    await new Promise((res) => setTimeout(res, 5000));

    this.roundStart(otherUserSocket, guessingUserSocket, matchId);
  }

  async handleDisconnect(socketId: string): Promise<void> {
    const userQueue = await this.queueService.findUserBySocketId(socketId);

    if (userQueue) {
      await this.queueService.removeUser(userQueue);
      return;
    }

    const match = await this.matchService.completeMatch(socketId);

    if (match) {
      this.guessWhoMatchRepository.deleteById(match.id);
    }

    this.logger.warn(`[disconnect] socketId=${socketId} matchId=${match ? match.id : null} | handle disconnect`);
  }

  
  private shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  private pickRandom<T>(list: T[]): T {
    return list[Math.floor(Math.random() * list.length)];
  }
}
