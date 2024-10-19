import { _decorator, Camera, Color, Component, director, EventMouse, EventTouch, Graphics, input, Input, instantiate, math, Node, Prefab, randomRangeInt, RigidBody2D, UITransform, Vec2, Vec3 } from 'cc';
import { Bubble } from './Bubble';
import { BaseComponent } from './BaseComponent';
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

    _systems: any = []
    _gunAngle: number = 0;
    _velocity: Vec2 = Vec2.ZERO;
    _type: number = 0;
    _graphics: Graphics;

    start() {
        super.start();
        input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this)
        input.on(Input.EventType.TOUCH_MOVE, this.onMouseMove, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        this._graphics = this.getComponent(Graphics);
    }

    onMouseMove(e: EventMouse | EventTouch) {
        let mousePosUI = e.getLocation();
        const mousePosWorld = new Vec3();
        this.camera.screenToWorld(new Vec3(mousePosUI.x, mousePosUI.y, 0), mousePosWorld);
        let mouseInNode = new Vec3();
        this.node.getComponent(UITransform).convertToNodeSpaceAR(mousePosWorld, mouseInNode);

        const angleInDegrees = math.toDegree(Math.atan2(mouseInNode.y, mouseInNode.x)) - 90;

        this.gun.angle = angleInDegrees;
        this._gunAngle = angleInDegrees;
        this._velocity = new Vec2(mouseInNode.x, mouseInNode.y).normalize().multiplyScalar(50);

        this._graphics.clear();
        this.drawLine(Vec3.ZERO, mouseInNode);
    }

    onTouchEnd() {
        const bubble = instantiate(this.bubblePrefab);
        bubble.parent = this.nodeParent;
        bubble.position = this.node.position;

        bubble.name = 'bubble-shoot';
        const newBubble = bubble.getComponent(Bubble);

        newBubble.setType(this._type);
        newBubble.setVeloccitry(this._velocity);
        newBubble.isShoot = true;

        this._type = this.getType();

        console.log('NEXT BUBBLE ', ['RED', 'GREEN', 'BLUE', 'YELLOW'][this._type]);
    }

    getType(): number {
        return randomRangeInt(0, 4);
    }

    drawLine(source: Vec3, target: Vec3) {
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
}

