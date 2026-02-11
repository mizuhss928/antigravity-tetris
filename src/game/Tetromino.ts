export type TetrominoType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

export interface TetrominoDef {
    type: TetrominoType;
    matrix: number[][]; // 0 or 1
    color: string;
}

export const TETROMINOES: Record<TetrominoType, TetrominoDef> = {
    'I': {
        type: 'I',
        matrix: [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        color: '#00f0f0' // シアン
    },
    'J': {
        type: 'J',
        matrix: [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#0000f0' // 青
    },
    'L': {
        type: 'L',
        matrix: [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#f0a000' // オレンジ
    },
    'O': {
        type: 'O',
        matrix: [
            [1, 1],
            [1, 1]
        ],
        color: '#f0f000' // 黄色
    },
    'S': {
        type: 'S',
        matrix: [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]
        ],
        color: '#00f000' // 緑
    },
    'T': {
        type: 'T',
        matrix: [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#a000f0' // 紫
    },
    'Z': {
        type: 'Z',
        matrix: [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0]
        ],
        color: '#f00000' // 赤
    }
};

export class Tetromino {
    public type: TetrominoType;
    public matrix: number[][];
    public x: number;
    public y: number;
    public color: string;

    constructor(type: TetrominoType) {
        this.type = type;
        this.matrix = TETROMINOES[type].matrix.map(row => [...row]); // Deep copy
        this.color = TETROMINOES[type].color;

        // 初期出現位置（中央上部）
        // 標準幅 10。中央は 3-6 あたり。
        this.x = Math.floor((10 - this.matrix[0].length) / 2);
        this.y = -2; // 見える領域の少し上から開始
    }

    public rotate(dir: 'left' | 'right'): void {
        const N = this.matrix.length;
        const newMatrix = Array.from({ length: N }, () => Array(N).fill(0));

        if (dir === 'right') {
            for (let y = 0; y < N; y++) {
                for (let x = 0; x < N; x++) {
                    newMatrix[x][N - 1 - y] = this.matrix[y][x];
                }
            }
        } else {
            for (let y = 0; y < N; y++) {
                for (let x = 0; x < N; x++) {
                    newMatrix[N - 1 - x][y] = this.matrix[y][x];
                }
            }
        }
        this.matrix = newMatrix;
    }
}
