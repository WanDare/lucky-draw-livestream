import Phaser from "phaser";
export class LightshowFrameComponent {
  /**
   * Creates and starts the lightshow animation.
   * @param scene Your Phaser.Scene
   * @param x     Center X
   * @param y     Center Y
   * @param options Optional: { size, depth, alpha, blendMode }
   * @returns { image, stop } — image is the Phaser.GameObjects.Image; stop() will destroy animation & image
   */
  static start(
    scene: Phaser.Scene,
    x: number,
    y: number,
    options?: {
      size?: number;
      depth?: number;
      alpha?: number;
      blendMode?: Phaser.BlendModes | string;
    }
  ): { image: Phaser.GameObjects.Image; stop: () => void } {
    const frames = ["lightshow1", "lightshow2", "lightshow3", "lightshow4"];
    let frameIdx = 0;
    const depth = options?.depth ?? 12;

    const image = scene.add
      .image(x, y, frames[0])
      .setOrigin(0.5)
      .setDisplaySize(1150, 250)
      .setDepth(depth);

    const timer = scene.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        frameIdx = (frameIdx + 1) % frames.length;
        image.setTexture(frames[frameIdx]);
      },
    });

    function stop() {
      timer.remove(false);
      image.destroy();
    }

    return { image, stop };
  }
}
