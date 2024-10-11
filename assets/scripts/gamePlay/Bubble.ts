import { _decorator, CircleCollider2D, Collider2D, Color, Component, Contact2DType, ERigidBody2DType, Input, input, IPhysics2DContact, Node, RigidBody2D, Sprite, tween, Vec2, Vec3 } from 'cc';
import { BubbleType } from '../Enum';
import { BaseComponent } from './BaseComponent';
import { eventTarget } from '../Utils';
import { CHAIN, DROP, OFF_PHYSICS, ON_PHYSICS, UN_CHAIN } from '../Events';
const { ccclass, property } = _decorator;

@ccclass('Bubble')
export class Bubble extends BaseComponent {
    private _type: BubbleType;

    private _collider: CircleCollider2D;
    private _rigibody: RigidBody2D;
    private _colors: Color[] = [Color.RED, Color.GREEN, Color.BLUE, Color.YELLOW];
    private _neighbors: Bubble[] = [];
    private _isChain: boolean = false;

    start() {
        super.start();
        this._collider = this.getComponent(CircleCollider2D);
        this._rigibody = this.getComponent(RigidBody2D);
        if (this._collider) {
            this._collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            this._collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        }

        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        eventTarget.on(UN_CHAIN, this.onUnChain, this);
        eventTarget.on(DROP, this.onDrop, this);
        eventTarget.on(OFF_PHYSICS, () => this.togglePhysics(false), this);
        eventTarget.on(ON_PHYSICS, () => this.togglePhysics(true), this);
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
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
            this._neighbors = this._neighbors.filter(b => b != otherBubble);
        }
    }

    setType(type: BubbleType) {
        this._type = type;
        this.getComponentInChildren(Sprite).color = this._colors[type];
    }

    onTouchStart() {
        this._store.sameType = [];
        this._store.neighbors = [];
        eventTarget.emit(UN_CHAIN);

        this._neighbors
            .filter(b => b._type == this._type)
            .forEach(b => b.findNeighbors());

        setTimeout(() => {
            // eventTarget.emit(ON_PHYSICS);
            this._store.endBubble.onChain();
            eventTarget.emit(DROP);
            // eventTarget.emit(OFF_PHYSICS);
        }, 500);
    }

    findNeighbors() {
        this._store.sameType.push(this);

        this._neighbors
            .filter(b => b._type == this._type && !this._store.sameType.includes(b))
            .forEach(b => b.findNeighbors());

        const position = this.node.position;
        const newPos = new Vec3(position.x, -1000);

        tween(this.node).to(1, { position: newPos })
            // .destroySelf()
            .call(() => this.node.destroy())
            .start();
        // console.log('name', this.name);
    }

    onChain() {
        this._isChain = true;
        this._store.neighbors.push(this);

        this._neighbors
            .filter(b => !this._store.neighbors.includes(b))
            .forEach(b => b.onChain());

        // console.log('onChain', this.name);
    }

    onDrop() {
        if (this._isChain) {
            return;
        }

        // console.log('onDrop',this.name);

        const position = this.node.position;
        const newPos = new Vec3(position.x, -1000);
        tween(this.node).to(1, { position: newPos })
            // .destroySelf()
            .call(() => this.node.destroy())
            .start();
    }

    onUnChain() {
        this._isChain = false;
    }

    togglePhysics(isActive: boolean) {
        // this._rigibody.enabled = isActive;
        // this._collider.enabled = isActive;
        this._rigibody.type = isActive
            ? ERigidBody2DType.Kinematic
            : ERigidBody2DType.Static;
    }
}


