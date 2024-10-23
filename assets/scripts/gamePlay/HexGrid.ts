import { _decorator,Vec3, Prefab, instantiate, Label, randomRangeInt } from 'cc';
import { Bubble } from './Bubble';
import { BaseComponent } from './BaseComponent';
import { eventTarget } from '../Utils';
import { ON_MOVE_DOWN } from '../Events';
const { ccclass, property } = _decorator;

@ccclass('HexGrid')
export class HexGrid extends BaseComponent {
    @property({ type: Prefab })
    hexPrefab: Prefab = null!;

    private _rows: number = 10;
    private _cols: number = 12;
    private _hexRadius: number = 48;

    start() {
        super.start();
        this.createHexGrid();
    }

    createHexGrid() {
        const sqrt3 = Math.sqrt(3);
        this._store.distanceBubble = this._hexRadius * 1.5;
        
        for (let row = 0; row < this._rows; row++) {
            for (let col = 0; col < this._cols; col++) {
                if (row % 2 != 0 && col == this._cols - 1) {
                    continue;
                }

                let x = this._hexRadius * sqrt3 * (col - this._cols / 2 + 0.5);
                let y = row * this._hexRadius * 1.5 + 300;

                if (row % 2 != 0) {
                    x += sqrt3 * this._hexRadius / 2;
                }

                const hex = instantiate(this.hexPrefab);
                hex.setPosition(new Vec3(x, y));
                this.node.addChild(hex);

                hex.getComponentInChildren(Label).string = `${row}-${col}`;
                hex.name = `bubble: ${row}-${col}`;

                const bubble = hex.getComponent(Bubble);
                bubble.setType(randomRangeInt(0, 4));
                bubble.name = `bubble ${row}-${col}`;

                this._store.bubbles.push(bubble);

                if (row == this._rows - 1 && col == 0) {
                    this._store.endBubble = bubble;
                }
            }
        }
 
        setTimeout(() => {
            this._store.bubbles.forEach(bubble => {
                bubble.setPhysicStatic();
                eventTarget.emit(ON_MOVE_DOWN);
            });
        }, 0);
    }
}
