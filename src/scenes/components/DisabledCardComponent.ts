import Phaser from "phaser";

export class DisabledCardComponent {
  static create(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number
  ): Phaser.GameObjects.Image {
    const card = scene.add
      .image(x, y, "Disable_card")
      .setDisplaySize(width, height)
      .setOrigin(0.5)
      .setAlpha(0.6)
      .setDepth(22);

    return card;
  }
}
