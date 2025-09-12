import useMatchStore from '@/store/match-store';
import { MatchMode } from '@/models/types/match-mode.type';
import { MatchFormat } from '@/models/types/match-format.type';
import { MatchLanguage } from '@/models/types/match-language.type';
import { InputMode } from '@/models/types/input-mode.type';
import IUserBuddy from '@/models/interfaces/user-buddy';

describe('useMatchStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useMatchStore.setState({
      matchMode: null,
      matchFormat: null,
      matchLanguage: null,
      inputMode: null,
      matchId: null,
      isOfferer: null,
      buddy: null,
    });
  });

  describe('Initial State', () => {
    it('should have initial state with all null values', () => {
      const state = useMatchStore.getState();
      
      expect(state.matchMode).toBeNull();
      expect(state.matchFormat).toBeNull();
      expect(state.matchLanguage).toBeNull();
      expect(state.inputMode).toBeNull();
      expect(state.matchId).toBeNull();
      expect(state.isOfferer).toBeNull();
      expect(state.buddy).toBeNull();
    });
  });

  describe('setMatchMode', () => {
    it('should set match mode correctly', async () => {
      const { setMatchMode } = useMatchStore.getState();
      
      await setMatchMode('word-builder');
      
      const state = useMatchStore.getState();
      expect(state.matchMode).toBe('word-builder');
    });

    it('should set just-chilling mode correctly', async () => {
      const { setMatchMode } = useMatchStore.getState();
      
      await setMatchMode('just-chilling');
      
      const state = useMatchStore.getState();
      expect(state.matchMode).toBe('just-chilling');
    });
  });

  describe('setMatchFormat', () => {
    it('should set match format correctly', async () => {
      const { setMatchFormat } = useMatchStore.getState();
      
      await setMatchFormat('solo');
      
      const state = useMatchStore.getState();
      expect(state.matchFormat).toBe('solo');
    });

    it('should set duo format correctly', async () => {
      const { setMatchFormat } = useMatchStore.getState();
      
      await setMatchFormat('duo');
      
      const state = useMatchStore.getState();
      expect(state.matchFormat).toBe('duo');
    });
  });

  describe('setMatchLanguage', () => {
    it('should set match language correctly', async () => {
      const { setMatchLanguage } = useMatchStore.getState();
      
      await setMatchLanguage('pt');
      
      const state = useMatchStore.getState();
      expect(state.matchLanguage).toBe('pt');
    });

    it('should set english language correctly', async () => {
      const { setMatchLanguage } = useMatchStore.getState();
      
      await setMatchLanguage('en');
      
      const state = useMatchStore.getState();
      expect(state.matchLanguage).toBe('en');
    });
  });

  describe('setInputMode', () => {
    it('should set typing input mode correctly', async () => {
      const { setInputMode } = useMatchStore.getState();
      
      await setInputMode('typing');
      
      const state = useMatchStore.getState();
      expect(state.inputMode).toBe('typing');
    });

    it('should set voice input mode correctly', async () => {
      const { setInputMode } = useMatchStore.getState();
      
      await setInputMode('voice');
      
      const state = useMatchStore.getState();
      expect(state.inputMode).toBe('voice');
    });
  });

  describe('setMatchId', () => {
    it('should set match ID correctly', async () => {
      const { setMatchId } = useMatchStore.getState();
      const testMatchId = 'test-match-123';
      
      await setMatchId(testMatchId);
      
      const state = useMatchStore.getState();
      expect(state.matchId).toBe(testMatchId);
    });
  });

  describe('setIsOfferer', () => {
    it('should set isOfferer to true', async () => {
      const { setIsOfferer } = useMatchStore.getState();
      
      await setIsOfferer(true);
      
      const state = useMatchStore.getState();
      expect(state.isOfferer).toBe(true);
    });

    it('should set isOfferer to false', async () => {
      const { setIsOfferer } = useMatchStore.getState();
      
      await setIsOfferer(false);
      
      const state = useMatchStore.getState();
      expect(state.isOfferer).toBe(false);
    });
  });

  describe('setUserBuddy', () => {
    it('should set user buddy correctly', async () => {
      const { setUserBuddy } = useMatchStore.getState();
      const mockBuddy: IUserBuddy = {
        username: 'testuser',
        nationality: 'BR',
      };
      
      await setUserBuddy(mockBuddy);
      
      const state = useMatchStore.getState();
      expect(state.buddy).toEqual(mockBuddy);
    });
  });

  describe('resetMatch', () => {
    it('should reset all match-related state to null', async () => {
      const store = useMatchStore.getState();
      
      // Set some values first
      await store.setMatchMode('word-builder');
      await store.setMatchFormat('solo');
      await store.setMatchLanguage('pt');
      await store.setInputMode('typing');
      await store.setMatchId('test-123');
      await store.setIsOfferer(true);
      await store.setUserBuddy({
        username: 'test',
        nationality: 'US',
      });
      
      // Reset
      await store.resetMatch();
      
      const state = useMatchStore.getState();
      expect(state.matchMode).toBeNull();
      expect(state.matchFormat).toBeNull();
      expect(state.matchLanguage).toBeNull();
      expect(state.inputMode).toBeNull();
      expect(state.matchId).toBeNull();
      expect(state.isOfferer).toBeNull();
      expect(state.buddy).toBeNull();
    });
  });

  describe('Complete Match Flow', () => {
    it('should handle complete word-builder solo match setup', async () => {
      const store = useMatchStore.getState();
      
      await store.setMatchMode('word-builder');
      await store.setMatchFormat('solo');
      await store.setMatchLanguage('en');
      await store.setInputMode('voice');
      
      const state = useMatchStore.getState();
      expect(state.matchMode).toBe('word-builder');
      expect(state.matchFormat).toBe('solo');
      expect(state.matchLanguage).toBe('en');
      expect(state.inputMode).toBe('voice');
    });

    it('should handle complete just-chilling duo match setup', async () => {
      const store = useMatchStore.getState();
      
      await store.setMatchMode('just-chilling');
      await store.setMatchFormat('duo');
      await store.setMatchLanguage('pt');
      
      const state = useMatchStore.getState();
      expect(state.matchMode).toBe('just-chilling');
      expect(state.matchFormat).toBe('duo');
      expect(state.matchLanguage).toBe('pt');
      // inputMode should still be null for just-chilling
      expect(state.inputMode).toBeNull();
    });
  });
});
