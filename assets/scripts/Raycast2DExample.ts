import { _decorator, Component, Vec2, PhysicsSystem2D, ERaycast2DType, EPhysics2DDrawFlags, Graphics, Vec3, Color } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Raycast2DExample')
export class Raycast2DExample extends Component {

    start() {
        // Bật debug để xem tia raycast và các collider trong khung cảnh
        // PhysicsSystem2D.instance.debugDrawFlags = EPhysics2DDrawFlags.All;

        // Thực hiện raycast
        this.performRaycast();
    }

    performRaycast() {
        // Điểm bắt đầu của tia (Vec2)
        let origin = new Vec2(0, 0);

        // Hướng của tia (Vec2), ví dụ: đi theo hướng trục X
        let direction = new Vec2(1, 0); // Hướng đi theo trục X

        // Chiều dài của tia
        let rayDistance = 1500;

        // this.drawLine(origin, direction.multiplyScalar(rayDistance));

        // Thực hiện raycast 2D
        let results = PhysicsSystem2D.instance.raycast(origin, direction, rayDistance, ERaycast2DType.All);

        // Kiểm tra kết quả
        if (results.length > 0) {
            console.log(`Số đối tượng va chạm: ${results.length}`);
            results.forEach((result, index) => {
                console.log(`Va chạm ${index + 1}: ${result.collider.node.name}`);
            });
        } else {
            console.log('Không có va chạm nào xảy ra.');
        }
    }

    drawLine(source: Vec2, target: Vec2) {
        const graphics = this.getComponent(Graphics);
        graphics.lineWidth = 7;

        graphics.strokeColor = new Color(255, 0, 0, 255);
        graphics.moveTo(source.x, source.y);
        graphics.lineTo(target.x, target.y);

        graphics.stroke();
    }
}
