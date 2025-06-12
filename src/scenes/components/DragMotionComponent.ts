import Phaser from "phaser";

type OnDropCallback = () => void;
type OnDragCallback = (progress: number) => void;

export class DragMotionComponent {
  static create(
    scene: Phaser.Scene,
    x: number,
    _y: number,
    options: {
      size?: number;
      depth?: number;
      onDrop: OnDropCallback;
      onDragProgress?: OnDragCallback;
    }
  ): Phaser.GameObjects.Container {
    const frames = ["Drag1", "Drag2", "Drag3"];
    let frameIdx = 0;
    const depth = options.depth ?? 5;

    const dragImage = scene.add
      .image(0, 0, frames[0])
      .setOrigin(0.5, 0)
      .setDisplaySize(133, 88)
      .setDepth(depth)
      .setAlpha(1)
      .setInteractive({ draggable: true, useHandCursor: true });

    const dragText = scene.add
      .image(0, 100, "DragText")
      .setOrigin(0.5, 0)
      .setDisplaySize(428, 60)
      .setDepth(depth);

    const container = scene.add
      .container(x, 300, [dragImage, dragText])
      .setDepth(depth);

    dragImage.setInteractive({ draggable: true, useHandCursor: true });
    scene.input.setDraggable(dragImage);

    const timer = scene.time.addEvent({
      delay: 400,
      loop: true,
      callback: () => {
        frameIdx = (frameIdx + 1) % frames.length;
        dragImage.setTexture(frames[frameIdx]);
      },
    });

    let dragStartY = 0;
    let hasDropped = false;
    let hasDragged = false;
    const dropThreshold = 48;

    dragImage.on("dragstart", (_pointer: Phaser.Input.Pointer) => {
      dragStartY = container.y;
      hasDropped = false;
      hasDragged = false;
    });

    dragImage.on(
      "drag",
      (_pointer: Phaser.Input.Pointer, _dragX: number, dragY: number) => {
        if (hasDropped) return;

        if (!hasDragged) {
          hasDragged = true;
          scene.tweens.add({
            targets: container,
            scale: 0.5,
            duration: 120,
            yoyo: true,
          });
        }

        const maxY = dragStartY + 80;
        container.y = Phaser.Math.Clamp(dragY, dragStartY, maxY);

        const progress = Phaser.Math.Clamp(
          (container.y - dragStartY) / (maxY - dragStartY),
          0,
          1
        );
        if (options.onDragProgress) {
          options.onDragProgress(progress);
        }
      }
    );

    dragImage.on("dragend", (_pointer: Phaser.Input.Pointer) => {
      hasDragged = false;
      if (!hasDropped && container.y > dragStartY + dropThreshold) {
        hasDropped = true;
        scene.tweens.add({
          targets: container,
          y: dragStartY + 56,
          scaleY: 0.5,
          duration: 120,
          yoyo: true,
          onComplete: () => {
            timer.remove(false);
            container.destroy();
            if (options.onDrop) options.onDrop();
          },
        });
      } else {
        scene.tweens.add({
          targets: container,
          y: dragStartY,
          scaleY: 0.5,
          duration: 110,
        });
      }
    });

    return container;
  }
}
