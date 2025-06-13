import Phaser from "phaser";
import type { PrizeInfo } from "../model/lucky_draw_model";

function maskPhone(phone: string): string {
  return phone.replace(/(\d{3}\s?\d{2})(\d{6})(\d{2})/, "$1XXXXXX$3");
}

export class PrizeCardComponent {
  static create(
    scene: Phaser.Scene,
    x: number,
    y: number,
    prize: PrizeInfo,
    width = 209,
    height = 65
  ): Phaser.GameObjects.Container {
    const cardBg = scene.add
      .image(0, 0, "card_bg")
      .setDisplaySize(width, height)
      .setOrigin(0.5);

    const nameText = scene.add
      .text(0, -height / 6, prize.name.toUpperCase(), {
        font: `bold ${Math.max(12, height / 4)}px Poppins`,
        color: "#ffffff",
        align: "center",
        fontStyle: "bold",
        letterSpacing: -0.32,
      })
      .setOrigin(0.5);

    const phoneText = scene.add
      .text(0, height / 6, maskPhone(prize.phone.toUpperCase()), {
        font: `bold ${Math.max(14, height / 3.2)}px Poppins`,
        color: "#ffffff",
        align: "center",
        fontStyle: "bold",
        letterSpacing: -0.4,
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
