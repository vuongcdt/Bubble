import { _decorator, CircleCollider2D, Collider2D, Color, Component, Contact2DType, ERigidBody2DType, Input, input, IPhysics2DContact, Node, randomRangeInt, RigidBody2D, Sprite, tween, Vec2, Vec3 } from 'cc';
import { BubbleType } from '../Enum';
import { BaseComponent } from './BaseComponent';
import { eventTarget } from '../Utils';
import { CHAIN, DROP, OFF_PHYSICS, ON_PHYSICS, UN_CHAIN } from '../Events';
const { ccclass, property } = _decorator;

@ccclass('Bubble')
export class Bubble extends BaseComponent {

    private _neighbors: Bubble[] = [];
    private _type: BubbleType;
    private _collider: CircleCollider2D;
    private _rigibody: RigidBody2D;
    private _colors: Color[] = [Color.RED, Color.GREEN, Color.BLUE, Color.YELLOW];
    private _isChain: boolean = false;
    private _isPhysic: boolean = false;

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

        setTimeout(() => {
            // this._rigibody.type = ERigidBody2DType.Static;
            // this._rigibody.enabled = false;
            // this._collider.enabled = false;
            this._isPhysic = true;
        }, 1000);
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (this._isPhysic) {
            const bubble = otherCollider.getComponent(Bubble);

            if (bubble) {
                this._rigibody.linearVelocity = Vec2.ZERO;
                const distance = Vec3.distance(this.node.position, otherCollider.node.position)
                console.log(bubble.name, this.node.position, otherCollider.node.position);

            }
        }

        if (!otherCollider) {
            return;
        }

        const otherBubble = otherCollider.getComponent(Bubble);
        if (otherBubble && !this._neighbors.includes(otherBubble)) {
            this._neighbors.push(otherBubble);
        }
    }

    onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (!otherCollider) {
            return;
        }
        const otherBubble = otherCollider.getComponent(Bubble);
        if (otherBubble) {
            this._neighbors = this._neighbors.filter(neighbor => neighbor != otherBubble);
        }
    }

    setType(type: BubbleType) {
        this._type = type;
        this.getComponentInChildren(Sprite).color = this._colors[type];
    }

    onTouchStart() {
        console.log('onTouchStart');

        this._store.sameType = [];
        this._store.neighbors = [];
        eventTarget.emit(UN_CHAIN);

        this.findNeighborsSameType();
        this._store.endBubble.onChain();

        setTimeout(() => {
            eventTarget.emit(DROP);
        }, 0);
    }

    findNeighborsSameType() {
        this._store.sameType.push(this);
        this.clearBubbleInNeighborsOfDifferentTypeBubble();

        this._neighbors
            .filter(neighbor => neighbor._type == this._type && !this._store.sameType.includes(neighbor))
            .forEach(neighbor => neighbor.findNeighborsSameType());

        tween(this.node)
            .to(1, { position: this.getPosTarget() })
            .call(() => this.node.destroy())
            .start();
    }

    clearBubbleInNeighborsOfDifferentTypeBubble() {
        this._neighbors
            .filter(neighbor => neighbor._type != this._type)
            .forEach(neighbor => neighbor._neighbors = neighbor._neighbors?.filter(i => i != this));
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
            .filter(neighbor => !this._store.neighbors.includes(neighbor))
            .forEach(neighbor => neighbor.onChain());
    }

    onDrop() {
        if (this._isChain) {
            return;
        }

        tween(this.node).to(1, { position: this.getPosTarget() })
            .call(() => this.node.destroy())
            .start();
    }

    onUnChain() {
        this._isChain = false;
    }

    getPosTarget() {
        return new Vec3(this.node.position.x + randomRangeInt(-200, 200), randomRangeInt(-500, -1000));
    }
}


