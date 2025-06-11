// components/DragMotionComponent.ts
import Phaser from "phaser";

type OnDropCallback = () => void;
type OnDragCallback = (progress: number) => void;
export class DragMotionComponent {
  static create(
    scene: Phaser.Scene,
    x: number,
    y: number,
    options: {
      size?: number;
      depth?: number;
      onDrop: OnDropCallback;
      onDragProgress?: OnDragCallback;
    }
  ): Phaser.GameObjects.Image {
    const frames = ["Drag1", "Drag2", "Drag3"];
    let frameIdx = 0;
    const depth = options.depth ?? 7;

    const dragImage = scene.add
      .image(x, 300, frames[0])
      .setOrigin(0.5, 0)
      .setDisplaySize(133, 88)
      .setDepth(depth)
      .setAlpha(1)
      .setInteractive({ draggable: true, useHandCursor: true });

    const timer = scene.time.addEvent({
      delay: 270,
      loop: true,
      callback: () => {
        frameIdx = (frameIdx + 1) % frames.length;
        dragImage.setTexture(frames[frameIdx]);
      },
    });

    let dragStartY = y;
    let hasDropped = false;
    const dragMaxDistance = 30;
    const dropThreshold = 48;

    dragImage.on("dragstart", (_pointer: Phaser.Input.Pointer) => {
      dragStartY = dragImage.y;
      hasDropped = false;
      scene.tweens.add({
        targets: dragImage,
        scale: 0.5,
        duration: 120,
        yoyo: true,
      });
    });

    dragImage.on(
      "drag",
      (_pointer: Phaser.Input.Pointer, _dragX: number, dragY: number) => {
        if (hasDropped) return;
        const maxY = dragStartY + 80;
        dragImage.y = Phaser.Math.Clamp(dragY, dragStartY, maxY);

        const progress = Phaser.Math.Clamp(
          (dragImage.y - dragStartY) / (maxY - dragStartY),
          0,
          1
        );
        if (options.onDragProgress) {
          options.onDragProgress(progress);
        }
      }
    );

    dragImage.on("dragend", (_pointer: Phaser.Input.Pointer) => {
      if (!hasDropped && dragImage.y > dragStartY + dropThreshold) {
        hasDropped = true;
        scene.tweens.add({
          targets: dragImage,
          y: dragStartY + 56,
          scaleY: 0.93,
          duration: 120,
          yoyo: true,
          onComplete: () => {
            timer.remove(false);
            dragImage.destroy();
            if (options.onDrop) options.onDrop();
          },
        });
      } else {
        scene.tweens.add({
          targets: dragImage,
          y: dragStartY,
          scaleY: 0.5,
          duration: 110,
        });
      }
    });

    return dragImage;
  }
}
