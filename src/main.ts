import { Game } from './core/Game';
import './style.css'; // Import global styles

document.addEventListener('DOMContentLoaded', () => {
  try {
    const game = new Game();
    game.start();
  } catch (error) {
    console.error('Failed to start game:', error);
  }
});
