import { _decorator, Camera, Component, director, EventMouse, EventTouch, input, Input, instantiate, Node, Prefab, RigidBody2D, UITransform, Vec2, Vec3 } from 'cc';
import { Bubble } from './Bubble';
const { ccclass, property } = _decorator;

@ccclass('Cannon')
export class Cannon extends Component {
    @property(Node)
    nodeParent: Node = null;
    @property(Camera)
    camera: Camera = null;
    @property(Node)
    gun: Node = null;
    @property(Prefab)
    bubblePrefab: Prefab = null;

    systems: any = []
    gunAngle: number = 0;
    velocity: Vec2 = Vec2.ZERO;

    start() {
        input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this)
        input.on(Input.EventType.TOUCH_MOVE, this.onMouseMove, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    onMouseMove(e: EventMouse | EventTouch) {
        let mousePosUI = e.getLocation();
        const mousePosWorld = new Vec3();
        this.camera.screenToWorld(new Vec3(mousePosUI.x, mousePosUI.y, 0), mousePosWorld);
        let mouseInNode = new Vec3();
        this.node.getComponent(UITransform).convertToNodeSpaceAR(mousePosWorld, mouseInNode);

        const direction = new Vec2(mouseInNode.x - this.node.position.x, mouseInNode.y - this.node.position.y);

        const angle = Math.atan2(direction.y, direction.x);

        const angleInDegrees = angle * (180 / Math.PI) - 90;

        this.gun.angle = angleInDegrees;
        this.gunAngle = angleInDegrees;
        this.velocity = direction;
    }

    onTouchEnd() {
        const bubble = instantiate(this.bubblePrefab);
        bubble.parent = this.nodeParent;
        bubble.position = this.node.position;

        bubble.name = 'bubble-shoot';

        bubble.getComponent(RigidBody2D).linearVelocity = this.velocity.clone().normalize().multiplyScalar(20);
    }
}

