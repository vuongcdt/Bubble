import { _decorator, Component, Graphics, Node } from 'cc';
import { Bubble } from './gamePlay/Bubble';
const { ccclass, property } = _decorator;

@ccclass('Store')
export default class Store {
    private static instance: Store;

    public sameType: Bubble[] = [];
    public neighbors: Bubble[] = [];
    public endBubble: Bubble;
    public graphics: Graphics;

    private constructor() { }

    public static getInstance(): Store {
        if (!Store.instance) {
            Store.instance = new Store();
        }
        return Store.instance;
    }
}


