export const Action = {
    MoveLeft: 'MoveLeft',
    MoveRight: 'MoveRight',
    SoftDrop: 'SoftDrop',
    HardDrop: 'HardDrop',
    RotateLeft: 'RotateLeft',
    RotateRight: 'RotateRight',
    Hold: 'Hold',
    Pause: 'Pause'
} as const;

export type Action = typeof Action[keyof typeof Action];

export class InputManager {
    private keyMap: Map<string, Action>;
    private keyState: Map<Action, boolean>;
    private prevKeyState: Map<Action, boolean>;

    constructor() {
        this.keyMap = new Map();
        this.keyState = new Map();
        this.prevKeyState = new Map();

        // デフォルトのキー割り当て
        this.bindKey('ArrowLeft', Action.MoveLeft);
        this.bindKey('ArrowRight', Action.MoveRight);
        this.bindKey('ArrowDown', Action.SoftDrop);
        this.bindKey('ArrowUp', Action.HardDrop); // または Space
        this.bindKey(' ', Action.HardDrop);
        this.bindKey('z', Action.RotateLeft);
        this.bindKey('x', Action.RotateRight);
        this.bindKey('c', Action.Hold);
        this.bindKey('Shift', Action.Hold);
        this.bindKey('Enter', Action.RotateRight);
        this.bindKey('Escape', Action.Pause);

        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
    }

    private bindKey(key: string, action: Action): void {
        this.keyMap.set(key, action);
    }

    private onKeyDown(event: KeyboardEvent): void {
        const action = this.keyMap.get(event.key);
        if (action) {
            this.keyState.set(action, true);
        }
    }

    private onKeyUp(event: KeyboardEvent): void {
        const action = this.keyMap.get(event.key);
        if (action) {
            this.keyState.set(action, false);
        }
    }

    public update(): void {
        // 現在の状態を前の状態にコピーして、トリガー検知に使用
        this.prevKeyState = new Map(this.keyState);
    }

    public isDown(action: Action): boolean {
        return this.keyState.get(action) === true;
    }

    public isPressed(action: Action): boolean {
        return this.keyState.get(action) === true && this.prevKeyState.get(action) !== true;
    }

    public rebind(action: Action, key: string): void {
        // 重複や混乱を防ぐため、このアクションに対する既存の割り当てをクリアする
        // マップをループして、このアクションにマップされているキーを削除
        for (const [k, a] of this.keyMap.entries()) {
            if (a === action) {
                this.keyMap.delete(k);
            }
        }

        // Add new binding
        this.keyMap.set(key, action);
    }

    public getActionForKey(key: string): Action | undefined {
        return this.keyMap.get(key);
    }

    public getKeysForAction(action: Action): string[] {
        const keys: string[] = [];
        for (const [key, act] of this.keyMap.entries()) {
            if (act === action) {
                // Determine if key needs formatting (e.g. " " -> "Space")
                keys.push(key === ' ' ? 'Space' : key);
            }
        }
        return keys;
    }
}
