import type { Scene } from '../core/Scene';
import { Renderer } from '../core/Renderer';
import { InputManager, Action } from '../core/Input';
import { SceneManager } from '../core/SceneManager';
import { GameScene } from './GameScene';
import { SettingsScene } from './SettingsScene';

export class TitleScene implements Scene {
    private sceneManager: SceneManager;
    private menuItems: string[] = ['ゲーム開始', '設定'];
    private selectedIndex: number = 0;

    constructor(sceneManager: SceneManager) {
        this.sceneManager = sceneManager;
    }

    enter(): void {
        console.log('タイトル画面に入りました');
        // 必要に応じてUI要素を作成、またはキャンバスに描画
        this.updateUI();
    }

    exit(): void {
        console.log('タイトル画面から出ました');
        const uiLayer = document.getElementById('ui-layer');
        if (uiLayer) uiLayer.innerHTML = '';
    }

    update(_deltaTime: number, input: InputManager): void {
        if (input.isPressed(Action.SoftDrop)) { // 下キー
            this.selectedIndex = (this.selectedIndex + 1) % this.menuItems.length;
            this.updateUI();
        } else if (input.isPressed(Action.HardDrop)) { // 上キー または Space
            this.selectedIndex = (this.selectedIndex - 1 + this.menuItems.length) % this.menuItems.length;
            this.updateUI();
        }

        if (input.isPressed(Action.RotateRight) || input.isPressed(Action.RotateLeft)) { // Enter / Z / X
            this.selectItem();
        }
    }

    render(_renderer: Renderer): void {
        // Canvasへの直接描画は行わず、DOM(ui-layer)に任せる。
        // これにより、CanvasとDOMの二重描画を防ぐ。
    }

    private selectItem(): void {
        if (this.selectedIndex === 0) {
            this.sceneManager.changeScene(new GameScene(this.sceneManager));
        } else if (this.selectedIndex === 1) {
            this.sceneManager.changeScene(new SettingsScene(this.sceneManager));
        }
    }

    private updateUI(): void {
        const uiLayer = document.getElementById('ui-layer');
        if (!uiLayer) return;

        // シンプルなDOMベースのメニューUI
        let html = '<div class="glass-panel" style="min-width: 400px; padding: 50px;">';
        html += '<h1 style="margin-bottom: 50px;">TETRIS</h1>';

        this.menuItems.forEach((item, index) => {
            const activeClass = index === this.selectedIndex ? 'active' : '';
            // インラインスタイルは最小限にし、クラスで制御したいが、動的なハイライトのため残す
            const style = index === this.selectedIndex
                ? 'background: var(--neon-cyan); color: #000; box-shadow: 0 0 15px var(--neon-cyan); transform: scale(1.1); font-weight: bold;'
                : 'background: transparent; color: var(--text-primary); border: 1px solid rgba(255,255,255,0.1);';

            // 検証用にdata-index属性を追加
            html += `<div class="btn ${activeClass}" data-index="${index}" style="${style} margin: 15px auto; width: 250px;">${item}</div>`;
        });
        html += '</div>';
        uiLayer.innerHTML = html;

        // イベントリスナーの追加
        const buttons = uiLayer.querySelectorAll('.btn');
        buttons.forEach((btn) => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget as HTMLElement;
                const index = parseInt(target.getAttribute('data-index') || '0');
                this.selectedIndex = index;
                this.selectItem();
            });

            // ホバー効果で選択状態を更新
            btn.addEventListener('mouseenter', (e) => {
                const target = e.currentTarget as HTMLElement;
                const index = parseInt(target.getAttribute('data-index') || '0');
                if (this.selectedIndex !== index) {
                    this.selectedIndex = index;
                    // updateUI()をここで呼び出すと再レンダリングのループでリスナーが失われる可能性があるため
                    // 視覚的なクラス更新のみを手動で行う
                    buttons.forEach(b => {
                        (b as HTMLElement).style.background = 'rgba(255,255,255,0.1)';
                        (b as HTMLElement).style.transform = 'scale(1.0)';
                        (b as HTMLElement).style.fontWeight = 'normal';
                        b.classList.remove('active');
                    });
                    target.style.background = 'rgba(255,255,255,0.3)';
                    target.style.transform = 'scale(1.1)';
                    target.style.fontWeight = 'bold';
                    target.classList.add('active');
                }
            });
        });
    }
}
