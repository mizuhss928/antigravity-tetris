import { Renderer } from './Renderer';
import { InputManager } from './Input';

export interface Scene {
    enter(): void;
    exit(): void;
    update(deltaTime: number, input: InputManager): void;
    render(renderer: Renderer): void;
}
