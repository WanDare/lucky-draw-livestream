// components/StagePrizeDisplayComponent.ts
import Phaser from "phaser";

export type StagePrizeConfig = {
  image: string;
  name: string;
  value: string;
};

export class StagePrizeDisplayComponent {
  static create(
    scene: Phaser.Scene,
    background2: Phaser.GameObjects.Image,
    prizeConfig: StagePrizeConfig
  ): Phaser.GameObjects.GameObject[] {
    const centerX = background2.x;
    const topY = background2.y - background2.displayHeight / 2 + 30;

    const displayPrizeBg = scene.add
      .image(centerX, topY + 110, "Displayprize")
      .setOrigin(0.5, 0)
      .setDisplaySize(345, 114)
      .setAlpha(0)
      .setDepth(background2.depth + 1);

    const prizeImg = scene.add
      .image(centerX, topY + 42, prizeConfig.image)
      .setOrigin(0.5, 0)
      .setDisplaySize(163, 95)
      .setAlpha(0)
      .setDepth(background2.depth + 2);

    const cardWidth = 200;
    const cardHeight = 64;
    const borderRadius = 14;
    const cardY = topY + 160;

    const cardBg = scene.add.graphics();
    cardBg.lineStyle(3, 0xf9ffb2, 0.85);
    cardBg.strokeRoundedRect(
      -cardWidth / 2,
      -cardHeight / 2,
      cardWidth,
      cardHeight,
      borderRadius
    );
    cardBg.fillStyle(0x214e16, 1);
    cardBg.fillRoundedRect(
      -cardWidth / 2,
      -cardHeight / 2,
      cardWidth,
      cardHeight,
      borderRadius
    );
    cardBg.setPosition(centerX, cardY);
    cardBg.setAlpha(0);
    cardBg.setDepth(background2.depth + 3);

    const nameText = scene.add
      .text(0, 25, prizeConfig.name, {
        font: "bold 12px Arial",
        color: "#ffffff",
        align: "center",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const valueText = scene.add
      .text(0, 45, prizeConfig.value, {
        font: "bold 12px Arial",
        color: "#FFD700",
        align: "center",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const cardContainer = scene.add.container(centerX, cardY, [
      cardBg,
      nameText,
      valueText,
    ]);
    cardContainer.setDepth(background2.depth + 4);
    cardContainer.setScale(0.7).setAlpha(0);

    // Animations
    scene.tweens.add({
      targets: displayPrizeBg,
      alpha: 1,
      duration: 350,
      ease: "Back.Out",
    });
    scene.tweens.add({
      targets: prizeImg,
      alpha: 1,
      y: topY + 35,
      duration: 360,
      delay: 100,
      ease: "Back.Out",
    });
    scene.tweens.add({
      targets: cardContainer,
      alpha: 1,
      scale: 1,
      duration: 350,
      delay: 180,
      ease: "Back.Out",
    });
    scene.tweens.add({
      targets: cardBg,
      alpha: 1,
      duration: 350,
      delay: 180,
      ease: "Back.Out",
    });

    return [displayPrizeBg, prizeImg, cardContainer, cardBg];
  }
}
