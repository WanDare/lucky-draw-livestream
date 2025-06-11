// components/PrizeCardComponent.ts
import Phaser from "phaser";
import type { PrizeInfo } from "../model/lucky_draw_model";

export class PrizeCardComponent {
  static create(
    scene: Phaser.Scene,
    x: number,
    y: number,
    prize: PrizeInfo
  ): Phaser.GameObjects.Container {
    const width = 209;
    const height = 65;
    const borderRadius = 16;

    const cardBg = scene.add.graphics();
    cardBg.lineStyle(4, 0xf9ffb2, 0.85);
    cardBg.strokeRoundedRect(
      -width / 2,
      -height / 2,
      width,
      height,
      borderRadius
    );
    cardBg.fillStyle(0x214e16, 1);
    cardBg.fillRoundedRect(
      -width / 2,
      -height / 2,
      width,
      height,
      borderRadius
    );

    const nameText = scene.add
      .text(0, -13, prize.name, {
        font: "bold 16px Poppins",
        color: "#ffffff",
        align: "center",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const phoneText = scene.add
      .text(0, 15, prize.phone, {
        font: "bold 20px Poppins",
        color: "#ffffff",
        align: "center",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const container = scene.add.container(x, y, [cardBg, nameText, phoneText]);
    container.setDepth(22);

    container.setScale(0.7).setAlpha(0);
    scene.tweens.add({
      targets: container,
      alpha: 1,
      scale: 1,
      duration: 200,
      ease: "Back.Out",
    });

    return container;
  }
}
