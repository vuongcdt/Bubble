import { _decorator, CircleCollider2D, Collider2D, Color, Contact2DType, ERigidBody2DType, IPhysics2DContact, math, Node, randomRangeInt, RigidBody2D, Sprite, tween, Vec2, Vec3 } from 'cc';
import { BubbleType } from '../Enum';
import { BaseComponent } from './BaseComponent';
import { eventTarget } from '../Utils';
import { DROP, UN_CHAIN } from '../Events';
import { Wall } from './Wall';
const { ccclass, property } = _decorator;

@ccclass('Bubble')
export class Bubble extends BaseComponent {
    public isShoot: boolean;

    private _neighbors: Bubble[] = [];
    private _type: BubbleType;
    private _collider: CircleCollider2D;
    private _rigibody: RigidBody2D;
    private _colors: Color[] = [Color.RED, Color.GREEN, Color.BLUE, Color.YELLOW];
    private _isChain: boolean = false;
    private _velocity: Vec2 = Vec2.ZERO;
    private _neighborPosList: Vec3[] = [
        new Vec3(83.13843876330611, 0),
        new Vec3(41.569219381653056, 72),
        new Vec3(-41.569219381653056, 72),
        new Vec3(-83.13843876330611, 0),
        new Vec3(-41.569219381653056, -72),
        new Vec3(41.569219381653056, -72),
    ];

    start() {
        super.start();
        this._collider = this.getComponent(CircleCollider2D);
        this._rigibody = this.getComponent(RigidBody2D);

        if (this._collider) {
            this._collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }

        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        eventTarget.on(UN_CHAIN, this.onUnChain, this);
        eventTarget.on(DROP, this.onDrop, this);
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (!otherCollider) {
            return;
        }

        const otherBubble = otherCollider.getComponent(Bubble);
        const wall = otherCollider.getComponent(Wall);

        if (wall && this.isShoot) {
            this._rigibody.linearVelocity = new Vec2(-this._velocity.x, this._velocity.y);
            return;
        }

        if (!otherBubble || this._neighbors.includes(otherBubble)) {
            return;
        }

        this._neighbors.push(otherBubble);
        this._rigibody.linearVelocity = Vec2.ZERO;

        if (this._neighbors.length == 1 && this.isShoot) {
            this.isShoot = false;
            const p1 = otherBubble.node.position;
            const p2 = this.node.position;

            const subtract = new Vec3(p1.x - p2.x, p1.y - p2.y);
            const angle = this.getAngle(subtract);

            for (const pos of this._neighborPosList) {
                const anglePos = this.getAngle(pos);

                if (angle <= anglePos + 30 && angle > anglePos - 30) {
                    setTimeout(() => {
                        this.node.position = new Vec3(p1.x - pos.x, p1.y - pos.y);
                        this.onTouchStart();
                    }, 0);
                    break;
                }
            }
        }

        if (this._neighbors.length == 6) {
            setTimeout(() => {
                this._rigibody.type = ERigidBody2DType.Static;
            }, 0);
        }
    }

    getAngle(direction: Vec3): number {
        const angle = math.toDegree(Math.atan2(direction.y, direction.x)) - 90;
        return angle;
    }

    onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (!otherCollider) {
            return;
        }

        const otherBubble = otherCollider.getComponent(Bubble);
        if (!otherBubble) {
            return;
        }

        this._neighbors = this._neighbors.filter(neighborBubble => neighborBubble != otherBubble);

        // if (this._neighbors.length < 6) {
        //     this._rigibody.type = ERigidBody2DType.Kinematic;
        // }
    }

    setType(type: BubbleType) {
        this._type = type;
        this.getComponentInChildren(Sprite).color = this._colors[type];
    }

    setVeloccitry(velocity: Vec2) {
        this._rigibody = this.getComponent(RigidBody2D);
        this._velocity = velocity;
        this._rigibody.linearVelocity = velocity;
    }

    onTouchStart() {
        console.log('onTouchStart');

        this._store.sameType = [];
        this._store.neighbors = [];
        eventTarget.emit(UN_CHAIN);

        this.findNeighborsSameType();
        this._store.endBubble.onChain();

        setTimeout(() => {
            // eventTarget.emit(DROP);
            this.onDrop();
        }, 1000);
    }

    findNeighborsSameType() {
        this._store.sameType.push(this);
        this.clearBubbleInNeighborsOfDifferentTypeBubble();

        this._neighbors
            .filter(neighborBubble => neighborBubble._type == this._type && !this._store.sameType.includes(neighborBubble))
            .forEach(neighborBubble => neighborBubble.findNeighborsSameType());

        // tween(this.node)
        //     .to(1, { position: this.getPosTarget() })
        //     .call(() => this.node.destroy())
        //     .start();

        this.onDrop();
    }

    clearBubbleInNeighborsOfDifferentTypeBubble() {
        this._neighbors
            .filter(neighborBubble => neighborBubble._type != this._type)
            .forEach(neighborBubble => neighborBubble._neighbors = neighborBubble._neighbors?.filter(i => i != this));
    }

    onChain() {
        this._isChain = true;
        if (!this._store?.neighbors) {
            return;
        }

        if (!this._store?.neighbors.includes(this)) {
            this._store.neighbors.push(this);
        }

        this._neighbors
            .filter(neighborBubble => !this._store.neighbors.includes(neighborBubble))
            .forEach(neighborBubble => neighborBubble.onChain());
    }

    onDrop() {
        if (this._isChain) {
            return;
        }

        if (this._store?.sameType.length < 3) {
            return;
        }

        tween(this.node)
            .to(1, { position: this.getPosTarget() })
            .call(() => this.node.destroy())
            .start();
    }

    onUnChain() {
        this._isChain = false;
    }

    getPosTarget() {
        return new Vec3(this.node?.position.x + randomRangeInt(-200, 200), randomRangeInt(-500, -1000));
    }
}


