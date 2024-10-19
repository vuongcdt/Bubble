import { _decorator, Camera, Color, Component, director, EventMouse, EventTouch, input, Input, instantiate, math, Node, Prefab, randomRangeInt, RigidBody2D, UITransform, Vec2, Vec3 } from 'cc';
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

    _systems: any = []
    _gunAngle: number = 0;
    _velocity: Vec2 = Vec2.ZERO;
    _type: number = 0;

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

        Vec3.add(mouseInNode, mouseInNode, this.node.position);

        const direction = new Vec2(mouseInNode.x - this.node.position.x, mouseInNode.y - this.node.position.y);
        const angleInDegrees = math.toDegree(Math.atan2(direction.y, direction.x)) - 90;

        this.gun.angle = angleInDegrees;
        this._gunAngle = angleInDegrees;
        this._velocity = direction.clone().normalize().multiplyScalar(50);
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
}

