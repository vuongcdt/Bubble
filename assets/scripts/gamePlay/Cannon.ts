import { _decorator, Camera, EventMouse, EventTouch, input, Input, instantiate, math, Node, Prefab, randomRangeInt, Sprite, UITransform, Vec2, Vec3 } from 'cc';
import { Bubble } from './Bubble';
import { BaseComponent } from './BaseComponent';
import { COLORS } from '../CONSTANTS';
const { ccclass, property } = _decorator;

@ccclass('Cannon')
export class Cannon extends BaseComponent {
    @property(Node)
    private nodeParent: Node = null;
    @property(Camera)
    private camera: Camera = null;
    @property(Node)
    private gun: Node = null;
    @property(Prefab)
    private bubblePrefab: Prefab = null;
    @property(Sprite)
    private spriteNextBubble: Sprite;

    private _velocity: Vec2 = Vec2.ZERO;
    private _type: number = 0;
    private _mouseNodePos: Vec3;
    private _speed: number = 70;

    start() {
        super.start();

        input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this)
        input.on(Input.EventType.TOUCH_MOVE, this.onMouseMove, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);

        this.setNextBubble();
    }

    onMouseMove(e: EventMouse | EventTouch) {
        let mousePosUI = e.getLocation();
        const mousePosWorld = this.camera.screenToWorld(new Vec3(mousePosUI.x, mousePosUI.y, 0));
        this._mouseNodePos = this.getNodePosFromWorldPos(mousePosWorld);

        const angleInDegrees = math.toDegree(Math.atan2(this._mouseNodePos.y, this._mouseNodePos.x)) - 90;

        this.gun.angle = angleInDegrees;
        this._velocity = new Vec2(this._mouseNodePos.x, this._mouseNodePos.y).normalize().multiplyScalar(this._speed);
    }

    onTouchEnd() {
        console.log(this._store.endBubble.name);
        
        const bubble = instantiate(this.bubblePrefab);
        bubble.parent = this.nodeParent;
        bubble.position = this.node.position;

        bubble.name = 'bubble-shoot';
        const newBubble = bubble.getComponent(Bubble);

        newBubble.initShoot(this._type, this._velocity);

        this.setNextBubble();
    }

    setNextBubble() {
        this._type = randomRangeInt(0, 4);
        this.spriteNextBubble.color = COLORS[this._type];
    }

    getNodePosFromWorldPos(worldPos: Vec3): Vec3 {
        return this.node.getComponent(UITransform).convertToNodeSpaceAR(worldPos);
    }
}

