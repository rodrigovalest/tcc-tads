export enum GuessWhoStatus {
  WAITING_FOR_PLAYERS = 'waiting_for_players',
  QUESTIONING = 'questioning',
  ANSWERING = 'answering',
  WAITING = 'waiting',
  GUESSING_OR_UNMARKING = 'guessing_or_unmarking',  
  WIN = 'win',
  LOSE = 'lose',
  WRONG_GUESS = 'wrong_guess',
  BUDDY_WRONG_GUESS = 'buddy_wrong_guess',
}
