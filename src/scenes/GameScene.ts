import type { Scene } from '../core/Scene';
import { Renderer } from '../core/Renderer';
import { InputManager, Action } from '../core/Input';
import { SceneManager } from '../core/SceneManager';
import { Board } from '../game/Board';
import { Bag } from '../game/Bag';
import { Tetromino } from '../game/Tetromino';
import { TitleScene } from './TitleScene';
import { GameOverScene } from './GameOverScene';

export class GameScene implements Scene {
    private sceneManager: SceneManager;
    private board: Board;
    private bag: Bag;
    private currentTetromino: Tetromino | null = null;
    private holdTetromino: Tetromino | null = null;
    private canHold: boolean = true;

    // ゲーム状態
    private score: number = 0;
    private lines: number = 0;
    private level: number = 1;
    private isPaused: boolean = false;
    private isGameOver: boolean = false;

    // タイミング管理
    private dropTimer: number = 0;
    private dropInterval: number = 1.0; // 落下間隔（秒）
    private lockDelay: number = 0.5; // 接地後の固定猶予時間
    private lockTimer: number = 0;

    // 自動リピート率 (ARR) / 遅延自動シフト (DAS) の処理は、よりスムーズな操作のためにここに追加可能
    // private moveTimer: number = 0;
    // private readonly moveInterval: number = 0.1;

    constructor(sceneManager: SceneManager) {
        this.sceneManager = sceneManager;
        this.board = new Board();
        this.bag = new Bag();
    }

    enter(): void {
        console.log('ゲーム画面に入りました');
        this.spawnTetromino();
        this.updateLevel();
    }

    exit(): void {
        console.log('ゲーム画面から出ました');
    }

    update(deltaTime: number, input: InputManager): void {
        if (this.isGameOver) {
            // ゲームオーバーロジックは spawnTetromino/transition で処理
            return;
        }

        if (input.isPressed(Action.Pause)) {
            // シンプルなポーズ切り替え、またはタイトルに戻る
            // 今のところ、「ポーズメニュー」の代わりとしてタイトルに戻る
            this.sceneManager.changeScene(new TitleScene(this.sceneManager));
            return;
        }

        if (this.isPaused) return;

        // Use moveTimer to suppress lint error for now (or implement DAS later)
        // if (this.moveTimer > 0) this.moveTimer -= deltaTime;

        // Input Handling
        this.handleInput(deltaTime, input);

        // Gravity
        this.dropTimer += deltaTime;
        if (this.dropTimer >= this.dropInterval) {
            this.dropTimer = 0;
            this.moveDown();
        }

        // Lock Timer logic could be more complex (reset on move), simplified here
        if (this.currentTetromino && !this.board.isValidPosition(this.currentTetromino, 0, 1)) {
            this.lockTimer += deltaTime;
            if (this.lockTimer >= this.lockDelay) {
                this.lock();
            }
        } else {
            this.lockTimer = 0;
        }
    }

    private handleInput(_deltaTime: number, input: InputManager): void {
        if (!this.currentTetromino) return;

        // Horizontal Movement
        if (input.isPressed(Action.MoveLeft)) {
            if (this.board.isValidPosition(this.currentTetromino, -1, 0)) {
                this.currentTetromino.x--;
                this.lockTimer = 0; // Reset lock timer on move
            }
        } else if (input.isPressed(Action.MoveRight)) {
            if (this.board.isValidPosition(this.currentTetromino, 1, 0)) {
                this.currentTetromino.x++;
                this.lockTimer = 0;
            }
        }

        // Continuous movement handling (DAS) omitted for brevity but recommended for feel

        // Rotation
        if (input.isPressed(Action.RotateLeft)) {
            this.currentTetromino.rotate('left');
            if (!this.board.isValidPosition(this.currentTetromino)) {
                // Wall kick (basic implementation)
                if (this.board.isValidPosition(this.currentTetromino, 1, 0)) this.currentTetromino.x++;
                else if (this.board.isValidPosition(this.currentTetromino, -1, 0)) this.currentTetromino.x--;
                else this.currentTetromino.rotate('right'); // Revert
            } else {
                this.lockTimer = 0;
            }
        } else if (input.isPressed(Action.RotateRight)) {
            this.currentTetromino.rotate('right');
            if (!this.board.isValidPosition(this.currentTetromino)) {
                // Wall kick
                if (this.board.isValidPosition(this.currentTetromino, 1, 0)) this.currentTetromino.x++;
                else if (this.board.isValidPosition(this.currentTetromino, -1, 0)) this.currentTetromino.x--;
                else this.currentTetromino.rotate('left'); // Revert
            } else {
                this.lockTimer = 0;
            }
        }

        // Soft Drop
        if (input.isDown(Action.SoftDrop)) {
            this.dropInterval = 0.05; // Fixed fast speed for soft drop
        } else {
            this.updateLevel(); // Reset speed
        }

        // Hard Drop
        if (input.isPressed(Action.HardDrop)) {
            while (this.board.isValidPosition(this.currentTetromino, 0, 1)) {
                this.currentTetromino.y++;
                this.score += 2; // Hard drop points
            }
            this.lock();
        }

        // Hold
        if (input.isPressed(Action.Hold)) {
            this.hold();
        }
    }

    private moveDown(): void {
        if (!this.currentTetromino) return;
        if (this.board.isValidPosition(this.currentTetromino, 0, 1)) {
            this.currentTetromino.y++;
        } else {
            // Landed, let lock timer handle it or lock immediately if hard drop
            // Actually, if we try to move down and can't, checking lock here helps responsiveness
        }
    }

    private lock(): void {
        if (!this.currentTetromino) return;

        // Check for Lock Out (Game Over if locked completely above visible board)
        // Or if any part is cut off. Standard rule: if any part of the locked piece is above the visible playfield (y < 0).
        // However, usually partial lockout is allowed in some versions, but fully above is definitely over.
        // Let's implement strict top-out: if any block is locked at y < 0, it's game over.
        let isLockOut = false;
        for (let y = 0; y < this.currentTetromino.matrix.length; y++) {
            for (let x = 0; x < this.currentTetromino.matrix[y].length; x++) {
                if (this.currentTetromino.matrix[y][x] !== 0) {
                    if (this.currentTetromino.y + y < 0) {
                        isLockOut = true;
                    }
                }
            }
        }

        if (isLockOut) {
            this.isGameOver = true;
            this.sceneManager.changeScene(new GameOverScene(this.sceneManager, this.score));
            return;
        }

        this.board.lockTetromino(this.currentTetromino);
        const cleared = this.board.clearLines();
        this.updateScore(cleared);

        this.currentTetromino = null;
        this.spawnTetromino();
    }

    private spawnTetromino(): void {
        this.currentTetromino = this.bag.next();
        this.canHold = true;
        this.lockTimer = 0;

        // Check spawn collision (Game Over)
        if (!this.board.isValidPosition(this.currentTetromino)) {
            this.isGameOver = true;
            this.sceneManager.changeScene(new GameOverScene(this.sceneManager, this.score));
        }
    }

    private hold(): void {
        if (!this.canHold || !this.currentTetromino) return;

        if (this.holdTetromino === null) {
            this.holdTetromino = this.currentTetromino;
            this.spawnTetromino();
        } else {
            const temp = this.currentTetromino;
            this.currentTetromino = this.holdTetromino;
            this.holdTetromino = temp;

            // Reset position of swapped tetromino
            this.currentTetromino.x = Math.floor((this.board.width - this.currentTetromino.matrix[0].length) / 2);
            this.currentTetromino.y = -2;

            // Check collision after swap just in case
            if (!this.board.isValidPosition(this.currentTetromino)) {
                // Should technically not happen often unless stacked high
                this.isGameOver = true;
                this.sceneManager.changeScene(new GameOverScene(this.sceneManager, this.score));
            }
        }

        this.canHold = false;
    }

    private updateScore(linesCleared: number): void {
        if (linesCleared === 0) return;

        const basePoints = [0, 100, 300, 500, 800]; // 0, 1, 2, 3, 4 lines
        this.score += basePoints[linesCleared] * this.level;
        this.lines += linesCleared;

        this.updateLevel();
    }

    private updateLevel(): void {
        // 10ラインごとにレベルアップ
        this.level = Math.floor(this.lines / 10) + 1;
        // 速度曲線 (Tetris Worldルールに近似)
        this.dropInterval = Math.pow(0.8 - ((this.level - 1) * 0.007), this.level - 1);
    }

    render(renderer: Renderer): void {
        // ボード背景の描画
        // ブロックサイズを30pxと仮定
        const blockSize = 30;
        const offsetX = (renderer.getWidth() - this.board.width * blockSize) / 2;
        const offsetY = (renderer.getHeight() - this.board.height * blockSize) / 2;

        const ctx = renderer.getContext();

        // ボードのグリッド/背景を描画
        ctx.fillStyle = 'rgba(0, 10, 20, 0.8)'; // Darker transparency
        ctx.fillRect(offsetX, offsetY, this.board.width * blockSize, this.board.height * blockSize);

        ctx.strokeStyle = 'rgba(0, 243, 255, 0.2)'; // Faint neon cyan grid
        ctx.lineWidth = 1;

        // Grid lines
        for (let x = 0; x <= this.board.width; x++) {
            ctx.beginPath();
            ctx.moveTo(offsetX + x * blockSize, offsetY);
            ctx.lineTo(offsetX + x * blockSize, offsetY + this.board.height * blockSize);
            ctx.stroke();
        }
        for (let y = 0; y <= this.board.height; y++) {
            ctx.beginPath();
            ctx.moveTo(offsetX, offsetY + y * blockSize);
            ctx.lineTo(offsetX + this.board.width * blockSize, offsetY + y * blockSize);
            ctx.stroke();
        }

        ctx.strokeStyle = '#00f3ff'; // Outer border neon
        ctx.lineWidth = 2;
        ctx.shadowColor = '#00f3ff';
        ctx.shadowBlur = 20;
        ctx.strokeRect(offsetX, offsetY, this.board.width * blockSize, this.board.height * blockSize);
        ctx.shadowBlur = 0; // Reset
        ctx.lineWidth = 1;

        // 固定されたブロックを描画
        for (let y = 0; y < this.board.height; y++) {
            for (let x = 0; x < this.board.width; x++) {
                const color = this.board.grid[y][x];
                if (color) {
                    this.drawBlock(ctx, offsetX + x * blockSize, offsetY + y * blockSize, blockSize, color);
                }
            }
        }

        // ゴースト（落下予測位置）を描画
        if (this.currentTetromino) {
            let ghostY = this.currentTetromino.y;
            while (this.board.isValidPosition(this.currentTetromino, 0, ghostY - this.currentTetromino.y + 1)) {
                ghostY++;
            }

            ctx.globalAlpha = 0.2; // Very faint
            this.drawTetromino(ctx, this.currentTetromino, offsetX, offsetY, blockSize, ghostY, true); // true for outline only
            ctx.globalAlpha = 1.0;

            // 操作中のテトリミノを描画
            this.drawTetromino(ctx, this.currentTetromino, offsetX, offsetY, blockSize);
        }

        // UI情報

        // スコア
        renderer.drawText('スコア', 100, 100, 20, '#aaaaaa', 'left');
        renderer.drawText(`${this.score}`, 100, 130, 30, 'white', 'left');

        // レベル
        renderer.drawText('レベル', 100, 200, 20, '#aaaaaa', 'left');
        renderer.drawText(`${this.level}`, 100, 230, 30, 'white', 'left');

        // ライン
        renderer.drawText('ライン', 100, 300, 20, '#aaaaaa', 'left');
        renderer.drawText(`${this.lines}`, 100, 330, 30, 'white', 'left');

        // 次のミノ
        renderer.drawText('ネクスト', 650, 100, 20, '#aaaaaa', 'left');
        // Preview Next
        const nextPieces = this.bag.peek(3);
        nextPieces.forEach((type, index) => {
            const tempTetro = new Tetromino(type);
            // Basic preview drawing at fixed positions
            const previewX = 650;
            const previewY = 130 + index * 80;
            this.drawPreviewTetromino(ctx, tempTetro, previewX, previewY, 20);
        });

        // ホールド
        renderer.drawText('ホールド', 650, 400, 20, '#aaaaaa', 'left');
        if (this.holdTetromino) {
            const previewX = 650;
            const previewY = 430;
            this.drawPreviewTetromino(ctx, this.holdTetromino, previewX, previewY, 20);
        }
    }

    private drawTetromino(ctx: CanvasRenderingContext2D, tetromino: Tetromino, offsetX: number, offsetY: number, blockSize: number, overrideY?: number, outlineOnly: boolean = false): void {
        const drawY = overrideY !== undefined ? overrideY : tetromino.y;

        for (let y = 0; y < tetromino.matrix.length; y++) {
            for (let x = 0; x < tetromino.matrix[y].length; x++) {
                if (tetromino.matrix[y][x] !== 0) {
                    // Check if visible (y >= 0)
                    if (drawY + y >= 0) {
                        this.drawBlock(ctx, offsetX + (tetromino.x + x) * blockSize, offsetY + (drawY + y) * blockSize, blockSize, tetromino.color, outlineOnly);
                    }
                }
            }
        }
    }

    private drawPreviewTetromino(ctx: CanvasRenderingContext2D, tetromino: Tetromino, x: number, y: number, blockSize: number): void {
        for (let r = 0; r < tetromino.matrix.length; r++) {
            for (let c = 0; c < tetromino.matrix[r].length; c++) {
                if (tetromino.matrix[r][c] !== 0) {
                    this.drawBlock(ctx, x + c * blockSize, y + r * blockSize, blockSize, tetromino.color);
                }
            }
        }
    }

    private drawBlock(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, outlineOnly: boolean = false): void {
        const padding = 2; // Gap between blocks
        const rectSize = size - padding * 2;
        const rectX = x + padding;
        const rectY = y + padding;

        ctx.shadowColor = color;
        ctx.shadowBlur = 15; // Neon glow

        if (outlineOnly) {
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(rectX, rectY, rectSize, rectSize);
        } else {
            // Inner Fill (Transparent)
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.5;
            ctx.fillRect(rectX, rectY, rectSize, rectSize);
            ctx.globalAlpha = 1.0;

            // Bright Core/Border
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.strokeRect(rectX, rectY, rectSize, rectSize);

            // Highlight (Glossy look)
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.fillRect(rectX, rectY, rectSize, size * 0.3);
        }

        ctx.shadowBlur = 0; // Reset
    }
}
