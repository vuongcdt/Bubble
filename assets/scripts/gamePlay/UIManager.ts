import { _decorator, Component, Graphics, Node } from 'cc';
import { BaseComponent } from './BaseComponent';
const { ccclass, property } = _decorator;

@ccclass('UIManager')
export class UIManager extends BaseComponent {

    start() {
        super.start();
        this._store.graphics = this.getComponent(Graphics);
    }
}


