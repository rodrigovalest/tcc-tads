import { MatchLanguage } from "../models/types/match-language.type";

interface Translation {
  word: string;
  translation: string;
  sourceLanguage: MatchLanguage;
  targetLanguage: MatchLanguage;
}

interface TranslationDictionary {
  [key: string]: {
    [targetLang: string]: string;
  };
}

const basicDictionary: Record<MatchLanguage, TranslationDictionary> = {
  en: {
    hello: { pt: "olá", es: "hola" },
    world: { pt: "mundo", es: "mundo" },
    cat: { pt: "gato", es: "gato" },
    dog: { pt: "cachorro", es: "perro" },
    house: { pt: "casa", es: "casa" },
    water: { pt: "água", es: "agua" },
    fire: { pt: "fogo", es: "fuego" },
    love: { pt: "amor", es: "amor" },
    friend: { pt: "amigo", es: "amigo" },
    family: { pt: "família", es: "familia" },
    time: { pt: "tempo", es: "tiempo" },
    life: { pt: "vida", es: "vida" },
    good: { pt: "bom", es: "bueno" },
    bad: { pt: "ruim", es: "malo" },
    yes: { pt: "sim", es: "sí" },
    no: { pt: "não", es: "no" },
    please: { pt: "por favor", es: "por favor" },
    "thank you": { pt: "obrigado", es: "gracias" },
    sorry: { pt: "desculpa", es: "lo siento" },
    book: { pt: "livro", es: "libro" },
    food: { pt: "comida", es: "comida" },
    music: { pt: "música", es: "música" },
    school: { pt: "escola", es: "escuela" },
    work: { pt: "trabalho", es: "trabajo" },
    money: { pt: "dinheiro", es: "dinero" },
    car: { pt: "carro", es: "coche" },
    tree: { pt: "árvore", es: "árbol" },
    flower: { pt: "flor", es: "flor" },
    sun: { pt: "sol", es: "sol" },
    moon: { pt: "lua", es: "luna" },
    star: { pt: "estrela", es: "estrella" },
    blue: { pt: "azul", es: "azul" },
    red: { pt: "vermelho", es: "rojo" },
    green: { pt: "verde", es: "verde" },
    white: { pt: "branco", es: "blanco" },
    black: { pt: "preto", es: "negro" },
    big: { pt: "grande", es: "grande" },
    small: { pt: "pequeno", es: "pequeño" },
    fast: { pt: "rápido", es: "rápido" },
    slow: { pt: "lento", es: "lento" },
    happy: { pt: "feliz", es: "feliz" },
    sad: { pt: "triste", es: "triste" },
    run: { pt: "correr", es: "correr" },
    walk: { pt: "caminhar", es: "caminar" },
    eat: { pt: "comer", es: "comer" },
    drink: { pt: "beber", es: "beber" },
    sleep: { pt: "dormir", es: "dormir" },
    speak: { pt: "falar", es: "hablar" },
    listen: { pt: "escutar", es: "escuchar" },
    see: { pt: "ver", es: "ver" },
    feel: { pt: "sentir", es: "sentir" },
    think: { pt: "pensar", es: "pensar" },
  },
  pt: {
    olá: { en: "hello", es: "hola" },
    mundo: { en: "world", es: "mundo" },
    gato: { en: "cat", es: "gato" },
    cachorro: { en: "dog", es: "perro" },
    casa: { en: "house", es: "casa" },
    água: { en: "water", es: "agua" },
    fogo: { en: "fire", es: "fuego" },
    amor: { en: "love", es: "amor" },
    amigo: { en: "friend", es: "amigo" },
    família: { en: "family", es: "familia" },
    tempo: { en: "time", es: "tiempo" },
    vida: { en: "life", es: "vida" },
    bom: { en: "good", es: "bueno" },
    ruim: { en: "bad", es: "malo" },
    sim: { en: "yes", es: "sí" },
    não: { en: "no", es: "no" },
    "por favor": { en: "please", es: "por favor" },
    obrigado: { en: "thank you", es: "gracias" },
    desculpa: { en: "sorry", es: "lo siento" },
    livro: { en: "book", es: "libro" },
    comida: { en: "food", es: "comida" },
    música: { en: "music", es: "música" },
    escola: { en: "school", es: "escuela" },
    trabalho: { en: "work", es: "trabajo" },
    dinheiro: { en: "money", es: "dinero" },
    carro: { en: "car", es: "coche" },
    árvore: { en: "tree", es: "árbol" },
    flor: { en: "flower", es: "flor" },
    sol: { en: "sun", es: "sol" },
    lua: { en: "moon", es: "luna" },
    estrela: { en: "star", es: "estrella" },
    azul: { en: "blue", es: "azul" },
    vermelho: { en: "red", es: "rojo" },
    verde: { en: "green", es: "verde" },
    branco: { en: "white", es: "blanco" },
    preto: { en: "black", es: "negro" },
    grande: { en: "big", es: "grande" },
    pequeno: { en: "small", es: "pequeño" },
    rápido: { en: "fast", es: "rápido" },
    lento: { en: "slow", es: "lento" },
    feliz: { en: "happy", es: "feliz" },
    triste: { en: "sad", es: "triste" },
    correr: { en: "run", es: "correr" },
    caminhar: { en: "walk", es: "caminar" },
    comer: { en: "eat", es: "comer" },
    beber: { en: "drink", es: "beber" },
    dormir: { en: "sleep", es: "dormir" },
    falar: { en: "speak", es: "hablar" },
    escutar: { en: "listen", es: "escuchar" },
    ver: { en: "see", es: "ver" },
    sentir: { en: "feel", es: "sentir" },
    pensar: { en: "think", es: "pensar" },
  },
  es: {
    hola: { en: "hello", pt: "olá" },
    mundo: { en: "world", pt: "mundo" },
    gato: { en: "cat", pt: "gato" },
    perro: { en: "dog", pt: "cachorro" },
    casa: { en: "house", pt: "casa" },
    agua: { en: "water", pt: "água" },
    fuego: { en: "fire", pt: "fogo" },
    amor: { en: "love", pt: "amor" },
    amigo: { en: "friend", pt: "amigo" },
    familia: { en: "family", pt: "família" },
    tiempo: { en: "time", pt: "tempo" },
    vida: { en: "life", pt: "vida" },
    bueno: { en: "good", pt: "bom" },
    malo: { en: "bad", pt: "ruim" },
    sí: { en: "yes", pt: "sim" },
    no: { en: "no", pt: "não" },
    "por favor": { en: "please", pt: "por favor" },
    gracias: { en: "thank you", pt: "obrigado" },
    "lo siento": { en: "sorry", pt: "desculpa" },
    libro: { en: "book", pt: "livro" },
    comida: { en: "food", pt: "comida" },
    música: { en: "music", pt: "música" },
    escuela: { en: "school", pt: "escola" },
    trabajo: { en: "work", pt: "trabalho" },
    dinero: { en: "money", pt: "dinheiro" },
    coche: { en: "car", pt: "carro" },
    árbol: { en: "tree", pt: "árvore" },
    flor: { en: "flower", pt: "flor" },
    sol: { en: "sun", pt: "sol" },
    luna: { en: "moon", pt: "lua" },
    estrella: { en: "star", pt: "estrela" },
    azul: { en: "blue", pt: "azul" },
    rojo: { en: "red", pt: "vermelho" },
    verde: { en: "green", pt: "verde" },
    blanco: { en: "white", pt: "branco" },
    negro: { en: "black", pt: "preto" },
    grande: { en: "big", pt: "grande" },
    pequeño: { en: "small", pt: "pequeno" },
    rápido: { en: "fast", pt: "rápido" },
    lento: { en: "slow", pt: "lento" },
    feliz: { en: "happy", pt: "feliz" },
    triste: { en: "sad", pt: "triste" },
    correr: { en: "run", pt: "correr" },
    caminar: { en: "walk", pt: "caminhar" },
    comer: { en: "eat", pt: "comer" },
    beber: { en: "drink", pt: "beber" },
    dormir: { en: "sleep", pt: "dormir" },
    hablar: { en: "speak", pt: "falar" },
    escuchar: { en: "listen", pt: "escutar" },
    ver: { en: "see", pt: "ver" },
    sentir: { en: "feel", pt: "sentir" },
    pensar: { en: "think", pt: "pensar" },
  },
};

export const getRandomWord = (fromLanguage: MatchLanguage): string => {
  const dictionary = basicDictionary[fromLanguage];
  const words = Object.keys(dictionary);
  return words[Math.floor(Math.random() * words.length)];
};

export const getTranslation = (
  word: string,
  fromLanguage: MatchLanguage,
  toLanguage: MatchLanguage
): string | null => {
  const normalizedWord = word.toLowerCase().trim();
  const dictionary = basicDictionary[fromLanguage];

  if (!dictionary || !dictionary[normalizedWord]) {
    return null;
  }

  return dictionary[normalizedWord][toLanguage] || null;
};

export const validateTranslation = (
  originalWord: string,
  userTranslation: string,
  fromLanguage: MatchLanguage,
  toLanguage: MatchLanguage
): boolean => {
  const correctTranslation = getTranslation(
    originalWord,
    fromLanguage,
    toLanguage
  );
  if (!correctTranslation) return false;

  const normalizedUserInput = userTranslation.toLowerCase().trim();
  const normalizedCorrect = correctTranslation.toLowerCase().trim();

  return normalizedUserInput === normalizedCorrect;
};

export const getAllWords = (language: MatchLanguage): string[] => {
  return Object.keys(basicDictionary[language]);
};

const translationService = {
  getRandomWord,
  getTranslation,
  validateTranslation,
  getAllWords,
};

export default translationService;
