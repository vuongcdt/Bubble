import { _decorator, BoxCollider2D, Camera, Color, ERaycast2DType, EventMouse, EventTouch, Graphics, input, Input, math, Node, PhysicsSystem2D, UITransform, v2, v3, Vec2, Vec3 } from 'cc';
import { BaseComponent } from './BaseComponent';
const { ccclass, property } = _decorator;

@ccclass('UIManager')
export class UIManager extends BaseComponent {
    @property(Node)
    point: Node = null;
    @property(Node)
    canon: Node = null;
    @property(Camera)
    camera: Camera = null;

    private _graphics: Graphics;
    private _canonWorldPos: Vec3 = Vec3.ZERO;
    private _canonNodePos: Vec3 = Vec3.ZERO;
    private _mouseNodePos: Vec3 = Vec3.ZERO;
    private _totalLength: number = 1200;
    private _startColor = new Color(255, 255, 0, 255);
    private _dashLength = 20;
    private _gapLength = 20;

    start() {
        this._graphics = this.getComponent(Graphics);
        this._canonNodePos = this.canon.position;

        input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this)
        input.on(Input.EventType.TOUCH_MOVE, this.onMouseMove, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);

    }

    onMouseMove(e: EventMouse | EventTouch) {
        let mousePosUI = e.getLocation();
        const mousePosWorld = this.camera.screenToWorld(new Vec3(mousePosUI.x, mousePosUI.y, 0));
        this._mouseNodePos = this.getNodePosFromWorldPos(mousePosWorld);
        this._mouseNodePos.z = 0;

        this._graphics.clear();

        const dirScalar = this.getDirScalar(this._canonNodePos, this._mouseNodePos);

        // this.drawJoin(this._canonNodePos, dirScalar);
        this.drawLine(this._canonNodePos, dirScalar);
        this.raycastInit(this._canonWorldPos, this.getWorldPosFromNodePos(dirScalar));
        // this.raycastInit(this._canonNodePos, dirScalar);
    }

    onTouchEnd() {

    }

    raycastInit(source: Vec3, target: Vec3) {
        const results = PhysicsSystem2D.instance.raycast(source, target, ERaycast2DType.All);

        if (results.length > 0) {
            const posWorld = new Vec3(results[0].point.x, results[0].point.y);
            const posNode = this.getNodePosFromWorldPos(posWorld);

            this.point.position = posNode;

            console.log(`Đã va chạm: ${posNode} ${results[0].collider.node.name}`);
        } else {
            console.log('Không có va chạm');
        }
    }

    getDirScalar(point: Vec3, dir: Vec3): Vec3 {
        const subtract = dir.clone().subtract(point);
        const scale = this._totalLength / Vec3.distance(dir.clone(), point.clone());

        return subtract.clone().multiplyScalar(scale).add(point);
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

    drawJoin(source: Vec3, target: Vec3) {
        this._graphics.lineWidth = 5;

        const startColor = this._startColor;
        const dashLength = this._dashLength;
        const gapLength = this._gapLength;
        const totalLength = this._totalLength;

        const dir = target.clone().subtract(source).normalize();

        for (let i = 0; i < totalLength; i += dashLength + gapLength) {
            const alpha = 255 * (1 - i / totalLength);
            const start = dir.clone().multiplyScalar(i).add(source);
            const end = dir.clone().multiplyScalar(i + dashLength).add(source);

            this._graphics.strokeColor = new Color(startColor.r, startColor.g, startColor.b, alpha);
            this._graphics.moveTo(start.x, start.y);
            this._graphics.lineTo(end.x, end.y);

            this._graphics.stroke();
        }
    }

    drawLine(source: Vec3, target: Vec3) {
        this._graphics.lineWidth = 5;

        this._graphics.strokeColor = new Color(255, 0, 0, 255);
        this._graphics.moveTo(source.x, source.y);
        this._graphics.lineTo(target.x, target.y);

        this._graphics.stroke();
    }
}


