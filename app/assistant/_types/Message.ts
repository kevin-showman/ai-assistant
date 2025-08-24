export interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot'; // Cambiado a 'user' y 'bot' para el chat
}