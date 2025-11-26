import api from '../api';
import { MatchMode } from '../models/types/match-mode.type';
import { MatchLanguage } from '../models/types/match-language.type';

export interface GameInvite {
  id: number;
  inviter: {
    id: number;
    username: string;
    name?: string;
    photo?: string;
  };
  invitee: {
    id: number;
    username: string;
    name?: string;
    photo?: string;
  };
  matchMode: MatchMode;
  matchLanguage: MatchLanguage;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'cancelled';
  createdAt: string;
  expiresAt: string;
}

export class GameInviteService {
  static async getPendingInvites(): Promise<GameInvite[]> {
    const response = await api.get('/game-invites/pending');
    return response.data;
  }

  static async getSentInvites(): Promise<GameInvite[]> {
    const response = await api.get('/game-invites/sent');
    return response.data;
  }
}

