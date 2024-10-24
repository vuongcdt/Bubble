import { _decorator, Component, Graphics, Node, Vec3 } from 'cc';
import { Bubble } from './gamePlay/Bubble';
const { ccclass, property } = _decorator;

@ccclass('Store')
export default class Store {
    private static instance: Store;

    public sameType: Bubble[] = [];
    public neighbors: Bubble[] = [];
    public bubbles: Bubble[] = [];
    public endBubble: Bubble;
    public graphics: Graphics;
    public distanceBubble: number = 0;

    private constructor() { }

    public static getInstance(): Store {
        if (!Store.instance) {
            Store.instance = new Store();
        }
        return Store.instance;
    }
}


