import { _decorator, Camera, Color, ERaycast2DType, EventMouse, EventTouch, Graphics, input, Input, instantiate, math, Node, PhysicsSystem2D, Prefab, randomRangeInt, Sprite, UITransform,  Vec2, Vec3 } from 'cc';
import { Bubble } from './Bubble';
import { BaseComponent } from './BaseComponent';
import { COLORS } from '../CONSTANTS';
const { ccclass, property } = _decorator;

@ccclass('Cannon')
export class Cannon extends BaseComponent {
    @property(Node)
    nodeParent: Node = null;
    @property(Camera)
    camera: Camera = null;
    @property(Node)
    gun: Node = null;
    @property(Prefab)
    bubblePrefab: Prefab = null;
    @property(Sprite)
    private spriteNextBubble: Sprite;
    @property(Node)
    point: Node = null;
    @property(Node)
    canvas: Node = null;

    private _velocity: Vec2 = Vec2.ZERO;
    private _type: number = 0;
    private _mouseNodePos: Vec3;

    start() {
        super.start();

        // PhysicsSystem2D.instance.debugDrawFlags = EPhysics2DDrawFlags.All;

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
        this._velocity = new Vec2(this._mouseNodePos.x, this._mouseNodePos.y).normalize().multiplyScalar(100);
    }

    onTouchEnd() {
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

    getDirLine(pos: Vec3): Vec3 {
        const dir = Math.abs(pos.x) > Math.abs(pos.y)
            ? new Vec3(pos.x / Math.abs(pos.x), pos.y / Math.abs(pos.x))
            : new Vec3(pos.x / Math.abs(pos.y), pos.y / Math.abs(pos.y));

        return dir.multiplyScalar(900);
    }

    getScreenPosFromWorldPos(worldPos: Vec3): Vec3 {
        return this.camera.worldToScreen(worldPos);;
    }

    getWorldPosFromNodePos(nodePos: Vec3): Vec3 {
        return this.node.getComponent(UITransform).convertToWorldSpaceAR(nodePos);
    }

    getNodePosFromWorldPos(worldPos: Vec3): Vec3 {
        return this.node.getComponent(UITransform).convertToNodeSpaceAR(worldPos);
    }
}

