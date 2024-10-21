import { _decorator, Camera, Color, EPhysics2DDrawFlags, ERaycast2DType, EventMouse, EventTouch, Graphics, input, Input, instantiate, math, Node, PhysicsSystem2D, Prefab, randomRangeInt, Sprite, UITransform, Vec2, Vec3 } from 'cc';
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

    private _velocity: Vec2 = Vec2.ZERO;
    private _type: number = 0;
    private _graphics: Graphics;
    private _canonWorldPos: Vec3;
    private _mouseNodePos: Vec3;

    start() {
        super.start();

        // PhysicsSystem2D.instance.debugDrawFlags = EPhysics2DDrawFlags.All;

        input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this)
        input.on(Input.EventType.TOUCH_MOVE, this.onMouseMove, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        this._graphics = this.getComponent(Graphics);

        this.setNextBubble();

        this._canonWorldPos = this.getWorldPosFromNodePos(this.node.position);
        console.log('Tọa độ thế giới của node:', this._canonWorldPos);
    }

    onMouseMove(e: EventMouse | EventTouch) {
        let mousePosUI = e.getLocation();
        const mousePosWorld = this.camera.screenToWorld(new Vec3(mousePosUI.x, mousePosUI.y, 0));
        this._mouseNodePos = this.getNodePosFromWorldPos(mousePosWorld);

        const angleInDegrees = math.toDegree(Math.atan2(this._mouseNodePos.y, this._mouseNodePos.x)) - 90;

        this.gun.angle = angleInDegrees;
        this._velocity = new Vec2(this._mouseNodePos.x, this._mouseNodePos.y).normalize().multiplyScalar(100);

        this._graphics.clear();
        this.raycastInit(this._canonWorldPos, mousePosWorld);
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

    raycastInit(source: Vec3, target: Vec3) {
        this.drawLine(Vec3.ZERO, this._mouseNodePos);

        const results = PhysicsSystem2D.instance.raycast(source, target, ERaycast2DType.Closest);

        if (results.length > 0) {
            const posWorld = new Vec3(results[0].point.x, results[0].point.y);
            const pointPosNode = new Vec3();
            this.node.getComponent(UITransform).convertToNodeSpaceAR(posWorld, pointPosNode);
            this.point.position = pointPosNode.clone().add(this.node.position);
            console.log(`pos node: ${pointPosNode} ${results[0].collider.node.name}`);
        } else {
            console.log('Không có va chạm');
        }
    }

    getWorldPosFromNodePos(nodePos: Vec3): Vec3 {
        return this.node.getComponent(UITransform).convertToWorldSpaceAR(nodePos);
    }

    getNodePosFromWorldPos(worldPos: Vec3): Vec3 {
        return this.node.getComponent(UITransform).convertToNodeSpaceAR(worldPos);
    }

    drawJoin(source: Vec3, target: Vec3) {
        this._graphics.lineWidth = 7;

        const startColor = new Color(255, 0, 0, 255);
        const dashLength = 50;
        const gapLength = 50;
        const totalLength = 2000;

        const dir = target.normalize();

        for (let i = 0; i < totalLength; i += dashLength + gapLength) {
            const alpha = 255 * (1 - i / totalLength);
            const start = dir.clone().multiplyScalar(i);
            const end = dir.clone().multiplyScalar(i + dashLength);

            this._graphics.strokeColor = new Color(startColor.r, startColor.g, startColor.b, alpha);
            this._graphics.moveTo(start.x, start.y);
            this._graphics.lineTo(end.x, end.y);

            this._graphics.stroke();
        }

    }

    drawLine(source: Vec3, target: Vec3) {
        this._graphics.lineWidth = 7;

        this._graphics.strokeColor = new Color(255, 0, 0, 255);
        this._graphics.moveTo(source.x, source.y);
        this._graphics.lineTo(target.x, target.y);

        this._graphics.stroke();
    }
}

