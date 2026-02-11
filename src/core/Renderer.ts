export class Renderer {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private width: number;
    private height: number;

    constructor(canvasId: string) {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (!canvas) {
            throw new Error(`キャンバス要素 (id: '${canvasId}') が見つかりませんでした。`);
        }
        this.canvas = canvas;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('2Dコンテキストの取得に失敗しました。');
        }
        this.ctx = ctx;

        // サイズの初期化
        this.width = 800; // デフォルト幅、後でレスポンシブ対応可能
        this.height = 600; // デフォルト高さ
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    public clear(): void {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    public getContext(): CanvasRenderingContext2D {
        return this.ctx;
    }

    public getWidth(): number {
        return this.width;
    }

    public getHeight(): number {
        return this.height;
    }

    public drawText(text: string, x: number, y: number, size: number = 24, color: string = 'white', align: CanvasTextAlign = 'left'): void {
        this.ctx.fillStyle = color;
        this.ctx.font = `${size}px 'Orbitron', sans-serif`;
        this.ctx.textAlign = align;
        this.ctx.shadowColor = color; // Text glow
        this.ctx.shadowBlur = 10;
        this.ctx.fillText(text, x, y);
        this.ctx.shadowBlur = 0; // Reset
    }
}
