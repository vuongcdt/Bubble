import { _decorator, CircleCollider2D, Collider2D, Color, Contact2DType, ERigidBody2DType, game, IPhysics2DContact, math, Node, randomRangeInt, RigidBody2D, Sprite, tween, Vec2, Vec3 } from 'cc';
import { BubbleType } from '../Enum';
import { BaseComponent } from './BaseComponent';
import { eventTarget } from '../Utils';
import { DROP, UN_CHAIN } from '../Events';
import { Wall } from './Wall';
import Store from '../Store';
import { COLORS, COLORS_TEXT } from '../CONSTANTS';
const { ccclass, property } = _decorator;

@ccclass('Bubble')
export class Bubble extends BaseComponent {
    @property(Sprite)
    private spriteChain: Sprite;

    private _isShoot: boolean;
    private _neighbors: Bubble[] = [];
    private _type: BubbleType;
    private _collider: CircleCollider2D;
    private _rigibody: RigidBody2D;
    private _isChain: boolean = false;
    private _velocity: Vec2 = Vec2.ZERO;
    private _neighborPosList: Vec3[] = [
        new Vec3(83.13843876330611, 0),
        new Vec3(-83.13843876330611, 0),
        new Vec3(41.569219381653056, 72),
        new Vec3(-41.569219381653056, 72),
        new Vec3(-41.569219381653056, -72),
        new Vec3(41.569219381653056, -72),
    ];

    start() {
        super.start();
        this.init();
    }

    private init() {
        this._collider = this.getComponent(CircleCollider2D);
        this._rigibody = this.getComponent(RigidBody2D);

        if (this._collider) {
            this._collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }

        // this.node.on(Node.EventType.TOUCH_START, this.checkChain, this);
        eventTarget.on(UN_CHAIN, this.onUnChain, this);
        eventTarget.on(DROP, this.onDrop, this);
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (!otherCollider) {
            return;
        }

        const otherBubble = otherCollider.getComponent(Bubble);
        const wall = otherCollider.getComponent(Wall);

        if (wall && this._isShoot) {
            this._rigibody.linearVelocity = new Vec2(-this._velocity.x, this._velocity.y);
            return;
        }

        if (!otherBubble || this._neighbors.includes(otherBubble)) {
            return;
        }

        this._neighbors.push(otherBubble);
        this._rigibody.linearVelocity = Vec2.ZERO;

        // if (this.node.name == 'bubble-shoot') {
        //     console.log('this._neighbors.length', this._neighbors.length);
        //     console.log(this.name, COLORS_TEXT[this._type], otherBubble.name, COLORS_TEXT[otherBubble._type]);
        // }

        if (this.node.name != 'bubble-shoot' || !this._isShoot) {
            return;
        }

        const p1 = otherBubble.node.position;
        const p2 = this.node.position;

        const subtract = new Vec3(p1.x - p2.x, p1.y - p2.y);
        const angle = this.getAngle(subtract);

        for (let index = 0; index < this._neighborPosList.length; index++) {
            const offsetPos = this._neighborPosList[index];
            const anglePos = this.getAngle(offsetPos);

            if (index < 2 && angle <= anglePos + 45 && angle > anglePos - 45) {
                this.setPosition(p1, offsetPos)
                break;
            }

            if (angle <= anglePos + 30 && angle > anglePos - 30) {
                this.setPosition(p1, offsetPos)
                break;
            }
        }
    }

    setPosition(posNeighbor: Vec3, offsetPos: Vec3) {
        setTimeout(() => {
            this.node.position = new Vec3(posNeighbor.x - offsetPos.x, posNeighbor.y - offsetPos.y);
            setTimeout(() => {
                this.checkChain();
            }, 50);
        }, 0);
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
    }

    initShoot(type: BubbleType, velocity: Vec2) {
        this.setType(type);

        this._rigibody = this.getComponent(RigidBody2D);
        this._velocity = velocity;
        this._rigibody.linearVelocity = velocity;
        this._isShoot = true;
        this._store = Store.getInstance();
        this.node.name = 'bubble-shoot';
    }

    setType(type: BubbleType) {
        this._type = type;
        this.getComponentInChildren(Sprite).color = COLORS[type];
    }

    checkChain() {
        this._isShoot = false;
        this._store.sameType = [];
        this._store.neighbors = [];
        eventTarget.emit(UN_CHAIN);
        
        // console.log('this._store.sameType', this._store.sameType);
        this.findNeighborsSameType();

        setTimeout(() => {
            this._store.endBubble.onChain();
        }, 100);

        setTimeout(() => {
            eventTarget.emit(DROP);
        }, 200);
    }

    findNeighborsSameType() {
        this._store.sameType.push(this);

        this._neighbors
            .filter(neighborBubble => neighborBubble._type == this._type && !this._store.sameType.includes(neighborBubble))
            .forEach(neighborBubble => neighborBubble.findNeighborsSameType());

        this.onDrop();
    }

    clearBubbleInNeighborsOfDifferentTypeBubble(bubbleClear: Bubble) {
        this._neighbors = this._neighbors.filter(i => i != bubbleClear)
    }

    onChain() {
        this._isChain = true;

        if (this.spriteChain) {
            this.spriteChain.color = Color.WHITE;
        }

        if (!this._store.neighbors.includes(this)) {
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

        if (this._store.sameType.length < 3) {
            // console.log('sameType.length < 3');
            
            return;
        }

        this._neighbors
            .filter(neighborBubble => neighborBubble._type != this._type)
            .forEach(neighborBubble => neighborBubble.clearBubbleInNeighborsOfDifferentTypeBubble(this));

        tween(this.node)
            .to(0.5, { position: this.getPosTarget() })
            .removeSelf()
            .start();
    }

    setPhysicStatic() {
        this._rigibody.type = ERigidBody2DType.Static;
    }

    onUnChain() {
        this._isChain = false;
        this.spriteChain.color = Color.BLACK;
    }

    getPosTarget() {
        return new Vec3(this.node.position.x + randomRangeInt(-200, 200), randomRangeInt(-500, -1000));
    }

    getAngle(direction: Vec3): number {
        const angle = math.toDegree(Math.atan2(direction.y, direction.x)) - 90;
        return angle;
    }
}


