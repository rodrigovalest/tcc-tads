// Exemplo de como usar os personagens do Who-Am-I com nomes

import { WHO_AM_I_CHARACTERS } from '../constants/who-am-i-characters';
import { WhoAmICharacter } from '../models/types/who-am-i-character.interface';

// Exemplo 1: Listar todos os personagens disponíveis
console.log('Personagens disponíveis:');
WHO_AM_I_CHARACTERS.forEach((character, index) => {
  console.log(`${index + 1}. ${character.name} (ID: ${character.id})`);
});

// Exemplo 2: Buscar um personagem por ID
const findCharacterById = (id: number): WhoAmICharacter | undefined => {
  return WHO_AM_I_CHARACTERS.find(char => char.id === id);
};

// Exemplo 3: Buscar um personagem por nome
const findCharacterByName = (name: string): WhoAmICharacter | undefined => {
  return WHO_AM_I_CHARACTERS.find(char => 
    char.name.toLowerCase().includes(name.toLowerCase())
  );
};

// Exemplo 4: Selecionar personagens aleatórios (similar ao que é feito no jogo)
const selectRandomCharacters = (usedCharacters: WhoAmICharacter[] = []): WhoAmICharacter[] => {
  // Filtra personagens que não foram usados
  const availableCharacters = WHO_AM_I_CHARACTERS.filter(char => 
    !usedCharacters.some(used => used.id === char.id)
  );
  
  // Se não há personagens suficientes, usa todos
  const charactersToChooseFrom = availableCharacters.length >= 2 ? availableCharacters : WHO_AM_I_CHARACTERS;
  
  // Embaralha e seleciona dois personagens diferentes
  const shuffled = [...charactersToChooseFrom].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1]];
};

// Exemplo de uso:
const usedChars: WhoAmICharacter[] = [];
const selectedChars = selectRandomCharacters(usedChars);
console.log('Personagens selecionados:', selectedChars.map(c => c.name));

// Adiciona os selecionados à lista de usados
usedChars.push(...selectedChars);

// Seleciona novos personagens (diferentes dos anteriores)
const newChars = selectRandomCharacters(usedChars);
console.log('Novos personagens:', newChars.map(c => c.name));
