import type { Scene } from '../core/Scene';
import { Renderer } from '../core/Renderer';
import { InputManager, Action } from '../core/Input';
import { SceneManager } from '../core/SceneManager';
import { TitleScene } from './TitleScene';
import { GameScene } from './GameScene'; // Circular dependency managed by type imports mostly, but runtime needs import

export class GameOverScene implements Scene {
    private sceneManager: SceneManager;
    private finalScore: number;
    private addedUI: boolean = false;

    constructor(sceneManager: SceneManager, score: number) {
        this.sceneManager = sceneManager;
        this.finalScore = score;
    }

    enter(): void {
        console.log('ゲームオーバー画面に入りました');
        this.updateUI();
    }

    exit(): void {
        console.log('ゲームオーバー画面から出ました');
        const uiLayer = document.getElementById('ui-layer');
        if (uiLayer) uiLayer.innerHTML = '';
        this.addedUI = false;
    }

    update(_deltaTime: number, input: InputManager): void {
        // 入力は主にDOMボタンで処理されますが、キーボードショートカットも追加可能です
        if (input.isPressed(Action.Hold)) { // 再開
            this.sceneManager.changeScene(new GameScene(this.sceneManager));
        }
        if (input.isPressed(Action.Pause)) { // タイトルへ
            this.sceneManager.changeScene(new TitleScene(this.sceneManager));
        }
    }

    render(_renderer: Renderer): void {
        // ゲームの最後のフレームを表示したままにするか？ それとも黒/ガラス背景にするか
        // 単純なアプローチとして、クリアしてテキストを表示します
        // renderer.clear(); // ゲーム画面を背後に表示したい場合はコメントアウトのままにする

        // UIオーバーレイが大部分を処理します
    }

    private updateUI(): void {
        const uiLayer = document.getElementById('ui-layer');
        if (!uiLayer || this.addedUI) return;

        this.addedUI = true;

        uiLayer.innerHTML = `
            <div class="glass-panel" style="min-width: 400px;">
                <h1 style="font-size: 3.5rem; margin-bottom: 20px; color: var(--neon-pink); text-shadow: 0 0 20px var(--neon-pink);">ゲームオーバー</h1>
                <p style="font-size: 2rem; margin: 30px 0;">スコア: <span style="color: var(--neon-lime); text-shadow: 0 0 10px var(--neon-lime);">${this.finalScore}</span></p>
                <div style="display: flex; gap: 20px; justify-content: center; margin-top: 40px;">
                    <button class="btn" id="retry-btn">リトライ</button>
                    <button class="btn" id="title-btn">タイトルへ</button>
                </div>
            </div>
         `;

        // イベントリスナーはinnerHTML設定後に追加する必要があります
        // DOMの準備を確実にするためにrequestAnimationFrameを使用
        requestAnimationFrame(() => {
            document.getElementById('retry-btn')?.addEventListener('click', () => {
                this.sceneManager.changeScene(new GameScene(this.sceneManager));
            });
            document.getElementById('title-btn')?.addEventListener('click', () => {
                this.sceneManager.changeScene(new TitleScene(this.sceneManager));
            });
        });
    }
}
