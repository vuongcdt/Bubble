import { _decorator, Camera, Color, ERaycast2DType, EventMouse, EventTouch, Graphics, input, Input, Node, PhysicsSystem2D, UITransform, Vec3 } from 'cc';
import { BaseComponent } from './BaseComponent';
const { ccclass, property } = _decorator;

@ccclass('UIManager')
export class UIManager extends BaseComponent {
    @property(Node)
    canon: Node = null;
    @property(Camera)
    camera: Camera = null;

    private _graphics: Graphics;
    private _canonWorldPos: Vec3 = Vec3.ZERO;
    private _canonNodePos: Vec3 = Vec3.ZERO;
    private _mouseNodePos: Vec3 = Vec3.ZERO;
    private _totalLength: number = 800;
    private _startColor = new Color(255, 255, 0, 255);
    private _dashLength = 50;
    private _gapLength = 30;

    start() {
        this._graphics = this.getComponent(Graphics);
        this._canonNodePos = this.canon.position;
        this._canonWorldPos = this.canon.getWorldPosition();

        input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this)
        input.on(Input.EventType.TOUCH_MOVE, this.onMouseMove, this);
    }

    onMouseMove(e: EventMouse | EventTouch) {
        let mousePosUI = e.getLocation();
        const mousePosWorld = this.camera.screenToWorld(new Vec3(mousePosUI.x, mousePosUI.y, 0));
        this._mouseNodePos = this.getNodePosFromWorldPos(mousePosWorld);
        this._mouseNodePos.z = 0;

        this._graphics.clear();

        const dirScalar = this.getDirScalar(this._canonNodePos, this._mouseNodePos);

        this.drawBrokenLine(this._canonNodePos, dirScalar, this._totalLength);
        this.raycastInit(this._canonWorldPos, dirScalar);
    }

    raycastInit(source: Vec3, targetNodePos: Vec3) {
        const target = this.getWorldPosFromNodePos(targetNodePos);
        const results = PhysicsSystem2D.instance.raycast(source, target, ERaycast2DType.Closest);

        if (results.length == 0) {
            return;
        } 

        const pointWorld = new Vec3(results[0].point.x, results[0].point.y);
        const pointNode = this.getNodePosFromWorldPos(pointWorld);

        const distance = this._totalLength - Vec3.distance(pointNode, this._canonNodePos);

        const subtract = targetNodePos.clone().subtract(pointNode.clone());
        const nextPos = pointNode.clone().add(new Vec3(-subtract.x, subtract.y));

        this.drawBrokenLine(pointNode, nextPos, distance);
    }

    drawBrokenLine(source: Vec3, target: Vec3, length: number) {
        this._graphics.lineWidth = 5;

        const startColor = this._startColor;
        const dashLength = this._dashLength;
        const gapLength = this._gapLength;

        const dir = target.clone().subtract(source).normalize();

        let i = length % (dashLength + gapLength) - gapLength;
        for (; i < length; i += dashLength + gapLength) {
            let alpha = 255 * (1 - i / this._totalLength);
            if (length < this._totalLength) {
                alpha = 255 * (1 - (i + this._totalLength - length) / this._totalLength);
            }
            const start = dir.clone().multiplyScalar(i).add(source);
            const end = dir.clone().multiplyScalar(i + dashLength).add(source);

            this._graphics.strokeColor = new Color(startColor.r, startColor.g, startColor.b, alpha);
            this._graphics.moveTo(start.x, start.y);
            this._graphics.lineTo(end.x, end.y);

            this._graphics.stroke();
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

    drawLine(source: Vec3, target: Vec3) {
        this._graphics.lineWidth = 5;

        this._graphics.strokeColor = new Color(255, 0, 0, 255);
        this._graphics.moveTo(source.x, source.y);
        this._graphics.lineTo(target.x, target.y);

        this._graphics.stroke();
    }
}


