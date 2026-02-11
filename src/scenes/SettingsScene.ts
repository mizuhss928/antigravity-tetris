import type { Scene } from '../core/Scene';
import { Renderer } from '../core/Renderer';
import { InputManager, Action } from '../core/Input';
import { SceneManager } from '../core/SceneManager';
import { TitleScene } from './TitleScene';

export class SettingsScene implements Scene {
    private sceneManager: SceneManager;
    private listeningForAction: Action | null = null;
    private addedUI: boolean = false;

    // 表示用のマッピング
    private actionNames: Record<Action, string> = {
        [Action.MoveLeft]: '左移動',
        [Action.MoveRight]: '右移動',
        [Action.SoftDrop]: 'ソフトドロップ',
        [Action.HardDrop]: 'ハードドロップ',
        [Action.RotateLeft]: '左回転',
        [Action.RotateRight]: '右回転',
        [Action.Hold]: 'ホールド',
        [Action.Pause]: 'ポーズ / 戻る'
    };

    constructor(sceneManager: SceneManager) {
        this.sceneManager = sceneManager;
    }

    enter(): void {
        console.log('設定画面に入りました');
        this.updateUI();
    }

    exit(): void {
        console.log('設定画面から出ました');
        const uiLayer = document.getElementById('ui-layer');
        if (uiLayer) uiLayer.innerHTML = '';
        this.addedUI = false;
        window.removeEventListener('keydown', this.handleRebind);
    }

    update(_deltaTime: number, input: InputManager): void {
        if (this.listeningForAction) return;

        if (input.isPressed(Action.Pause)) {
            this.sceneManager.changeScene(new TitleScene(this.sceneManager));
        }
    }

    render(_renderer: Renderer): void {
        // UIオーバーレイが大部分を処理します
    }

    private handleRebind = (e: KeyboardEvent) => {
        if (!this.listeningForAction) return;

        e.preventDefault();
        e.stopPropagation();

        // ここでInputManagerにアクセスできるか確認する必要があります。
        // 簡単にはアクセスできないため、シングルトンを使用するか、構築時に渡す必要がありますが、
        // ここではSceneManager経由でアクセスできると仮定します。
    };

    private updateUI(): void {
        const uiLayer = document.getElementById('ui-layer');
        if (!uiLayer || this.addedUI) return;

        let rows = '';
        Object.values(Action).forEach((action: Action) => {
            // 現在のキーを取得
            // SceneManagerがinputをpublicに持っているためキャストしてアクセス
            const keys = (this.sceneManager as any).input.getKeysForAction(action).join(', ');

            rows += `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; background: rgba(255,255,255,0.03); padding: 5px 10px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.05);">
                    <div style="flex: 1; text-align: left; overflow: hidden; white-space: nowrap;">
                        <span style="font-size: 0.85rem; display: block; color: var(--text-primary); text-overflow: ellipsis; overflow: hidden;">${this.actionNames[action]}</span>
                        <span style="font-size: 0.75rem; color: var(--neon-cyan); letter-spacing: 0.5px;">${keys || '(なし)'}</span>
                    </div>
                    <button class="btn config-btn" data-action="${action}" style="font-size: 0.7rem; padding: 4px 10px; min-width: 60px; margin: 0 0 0 10px; height: auto;">変更</button>
                </div>
            `;
        });

        uiLayer.innerHTML = `
            <div class="glass-panel" style="width: 580px; padding: 20px;">
                <h2 style="margin-bottom: 15px; font-size: 1.5rem;">設定</h2>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; text-align: left; margin-bottom: 15px;">
                    ${rows}
                </div>
                <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px;">
                    <div id="status-msg" style="height: 20px; font-size: 0.8rem; color: var(--neon-lime); margin-bottom: 10px; text-shadow: 0 0 5px var(--neon-lime);"></div>
                    <button class="btn" id="back-btn" style="width: 180px; padding: 10px 20px; font-size: 1rem; margin: 0;">戻る</button>
                </div>
            </div>
         `;

        const backBtn = document.getElementById('back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.sceneManager.changeScene(new TitleScene(this.sceneManager));
            });
        }

        const configBtns = uiLayer.querySelectorAll('.config-btn');
        configBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget as HTMLElement;
                const action = target.getAttribute('data-action') as Action;
                this.startRebind(action);
            });
        });

        this.addedUI = true;
    }

    private startRebind(action: Action): void {
        this.listeningForAction = action;
        const msg = document.getElementById('status-msg');
        if (msg) msg.textContent = `${this.actionNames[action]} のキーを押してください...`;

        // ワンタイムリスナー
        const listener = (e: KeyboardEvent) => {
            e.preventDefault();
            // SceneManager経由でInputManagerにアクセス (publicアクセサが必要)
            const inputManager = (this.sceneManager as any).input;
            if (inputManager && typeof inputManager.rebind === 'function') {
                inputManager.rebind(action, e.key);
                console.log(`${action} を ${e.key} に再バインドしました`);
            }

            this.listeningForAction = null;
            window.removeEventListener('keydown', listener);

            // UIを更新して新しいキー割り当てを表示
            this.addedUI = false;
            this.updateUI();

            // 確認メッセージを表示 (UI再構築後に設定する必要がある)
            const newMsg = document.getElementById('status-msg');
            if (newMsg) newMsg.textContent = `${e.key} に設定しました`;
        };

        window.addEventListener('keydown', listener);
    }
}
