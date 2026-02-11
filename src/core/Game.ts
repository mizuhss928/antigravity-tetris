import { Renderer } from './Renderer';
import { InputManager } from './Input';
import { SceneManager } from './SceneManager';
import { TitleScene } from '../scenes/TitleScene';

export class Game {
    private renderer: Renderer;
    private input: InputManager;
    private sceneManager: SceneManager;
    private lastTime: number = 0;
    private isRunning: boolean = false;

    constructor() {
        this.renderer = new Renderer('game-canvas');
        this.input = new InputManager();
        this.sceneManager = new SceneManager(this.renderer, this.input);

        // タイトル画面から開始
        this.sceneManager.changeScene(new TitleScene(this.sceneManager));
    }

    public start(): void {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
        requestAnimationFrame(this.loop.bind(this));
        console.log('ゲーム開始');
    }

    private loop(timestamp: number): void {
        if (!this.isRunning) return;

        const deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame(this.loop.bind(this));
    }

    private update(deltaTime: number): void {
        this.sceneManager.update(deltaTime);
        this.input.update();
    }

    private render(): void {
        this.renderer.clear();
        this.sceneManager.render();
    }
}
