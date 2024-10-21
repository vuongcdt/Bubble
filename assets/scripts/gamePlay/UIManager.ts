import { _decorator, BoxCollider2D, Camera, Collider2D, Color, Component, Contact2DType, ERaycast2DType, EventMouse, EventTouch, Graphics, input, Input, instantiate, IPhysics2DContact, math, Node, PhysicsSystem2D, Prefab, Sprite, UITransform, Vec2, Vec3 } from 'cc';
import { BaseComponent } from './BaseComponent';
const { ccclass, property } = _decorator;

@ccclass('UIManager')
export class UIManager extends BaseComponent {
    @property(Node)
    point: Node = null;

    private _graphics: Graphics;
    private _collider: BoxCollider2D;

    start() {
        this._collider = this.getComponent(BoxCollider2D);
        console.log(this.node.position);
        // if (this._collider) {
        //     this._collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        // }

        this._graphics = this.getComponent(Graphics);
    }

    update(deltaTime: number) {
        const pos = this.node.position;
        
        this.raycastInit(pos.clone(), pos.clone().add(new Vec3(0, 200)));
        this.drawLine(pos.clone(), pos.clone().add(new Vec3(0, 200)));

    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (!otherCollider) {
            return;
        }
        const pos = this.node.position;
        // this.raycastInit(new Vec3(-10, -40), pos.clone().add(new Vec3(0, 200)));
    }

    raycastInit(source: Vec3, target: Vec3) {
        const results = PhysicsSystem2D.instance.raycast(source, target, ERaycast2DType.All);

        if (results.length > 0) {
            const posNode = new Vec3();
            const posWorld = new Vec3(results[0].point.x,results[0].point.y);

            this.node.getComponent(UITransform).convertToNodeSpaceAR(posWorld, posNode);
            this.point.position = posNode;

            console.log(`Đã va chạm: ${posNode} ${results[0].collider.node.name}`);
        } else {
            console.log('Không có va chạm');
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


