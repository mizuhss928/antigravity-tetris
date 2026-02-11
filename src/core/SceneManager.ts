import type { Scene } from '../core/Scene';
import { Renderer } from './Renderer';
import { InputManager } from './Input';

export class SceneManager {
    private currentScene: Scene | null = null;
    private renderer: Renderer;
    public input: InputManager;

    constructor(renderer: Renderer, input: InputManager) {
        this.renderer = renderer;
        this.input = input;
    }

    public changeScene(scene: Scene): void {
        if (this.currentScene) {
            this.currentScene.exit();
        }
        this.currentScene = scene;
        this.currentScene.enter();
    }

    public update(deltaTime: number): void {
        if (this.currentScene) {
            this.currentScene.update(deltaTime, this.input);
        }
    }

    public render(): void {
        if (this.currentScene) {
            this.currentScene.render(this.renderer);
        }
    }
}
