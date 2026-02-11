import { Tetromino } from './Tetromino';

export class Board {
    public width: number = 10;
    public height: number = 20;
    public grid: (string | null)[][]; // Stores color string or null

    constructor() {
        this.grid = Array.from({ length: this.height }, () => Array(this.width).fill(null));
    }

    public reset(): void {
        this.grid = Array.from({ length: this.height }, () => Array(this.width).fill(null));
    }

    public isValidPosition(tetromino: Tetromino, offsetX: number = 0, offsetY: number = 0): boolean {
        for (let y = 0; y < tetromino.matrix.length; y++) {
            for (let x = 0; x < tetromino.matrix[y].length; x++) {
                if (tetromino.matrix[y][x] !== 0) {
                    const targetX = tetromino.x + x + offsetX;
                    const targetY = tetromino.y + y + offsetY;

                    // 壁判定
                    if (targetX < 0 || targetX >= this.width || targetY >= this.height) {
                        return false;
                    }

                    // ブロック判定（ボードより上の場合は無視）
                    if (targetY >= 0 && this.grid[targetY][targetX] !== null) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    public lockTetromino(tetromino: Tetromino): void {
        for (let y = 0; y < tetromino.matrix.length; y++) {
            for (let x = 0; x < tetromino.matrix[y].length; x++) {
                if (tetromino.matrix[y][x] !== 0) {
                    const targetY = tetromino.y + y;
                    const targetX = tetromino.x + x;
                    if (targetY >= 0 && targetY < this.height && targetX >= 0 && targetX < this.width) {
                        this.grid[targetY][targetX] = tetromino.color;
                    }
                }
            }
        }
    }

    public clearLines(): number {
        let linesCleared = 0;
        for (let y = this.height - 1; y >= 0; y--) {
            if (this.grid[y].every(cell => cell !== null)) {
                this.grid.splice(y, 1);
                this.grid.unshift(Array(this.width).fill(null));
                linesCleared++;
                y++; // Recheck same row index as rows shifted down
            }
        }
        return linesCleared;
    }
}
