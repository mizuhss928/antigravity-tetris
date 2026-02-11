import { Tetromino, type TetrominoType } from './Tetromino';

export class Bag {
    private bag: TetrominoType[] = [];

    constructor() {
        this.fillBag();
    }

    private fillBag(): void {
        const types: TetrominoType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
        // シャッフル
        for (let i = types.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [types[i], types[j]] = [types[j], types[i]];
        }
        this.bag.push(...types);
    }

    public next(): Tetromino {
        if (this.bag.length === 0) {
            this.fillBag();
        }
        const type = this.bag.shift()!;
        return new Tetromino(type);
    }

    public peek(count: number = 1): TetrominoType[] {
        if (this.bag.length < count) {
            this.fillBag(); // 十分なアイテムを確保
        }
        return this.bag.slice(0, count);
    }
}
