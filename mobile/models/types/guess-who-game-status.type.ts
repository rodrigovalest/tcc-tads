export type GuessWhoGameStatus =
  | "questioning"
  | "answering"
  | "waiting"
  | "guessing_or_unmarking"
  | "buddy_wrong_guess"
  | "wrong_guess"
  | "win"
  | "lose";
