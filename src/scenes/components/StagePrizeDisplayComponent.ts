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
      .image(centerX, topY + 143, "Displayprize")
      .setOrigin(0.5, 0)
      .setDisplaySize(270, 80)
      .setAlpha(0)
      .setDepth(background2.depth + 1);

    const prizeImg = scene.add
      .image(centerX, 220, prizeConfig.image)
      .setOrigin(0.5, 0)
      .setDisplaySize(154, 161)
      .setAlpha(0)
      .setDepth(background2.depth + 2);

    const cardWidth = 175;
    const cardHeight = 64;
    const cardY = topY + 190;

    const cardBg = scene.add
      .image(0, 0, "Prize_card")
      .setDisplaySize(cardWidth, cardHeight)
      .setOrigin(0.5);

    const nameText = scene.add
      .text(0, 0, prizeConfig.name.toUpperCase(), {
        fontSize: 16,
        fontFamily: "Poppins",
        fontStyle: "bold",
        color: "#ffffff",
        align: "center",
        letterSpacing: -0.32,
        wordWrap: { width: cardWidth - 16, useAdvancedWrap: true },
      })
      .setOrigin(0.5, 0);

    const valueText = scene.add
      .text(0, 0, prizeConfig.value.toUpperCase(), {
        font: "bold 16px Poppins",
        color: "#ffffff",
        align: "center",
        fontStyle: "bold",
        fontSize: "24px",
        wordWrap: { width: cardWidth - 16, useAdvancedWrap: true },
      })
      .setOrigin(0.5);

    const paddingY = 15;
    const totalTextHeight = nameText.height + valueText.height + paddingY;

    nameText.y = -totalTextHeight / 2 + 3;
    valueText.y = nameText.y + nameText.height + paddingY;

    const cardContainer = scene.add.container(centerX, cardY, [
      cardBg,
      nameText,
      valueText,
    ]);
    cardContainer.setDepth(background2.depth + 4);
    cardContainer.setScale(0.7).setAlpha(0);

    scene.tweens.add({
      targets: displayPrizeBg,
      alpha: 1,
      duration: 350,
      ease: "Back.Out",
    });
    scene.tweens.add({
      targets: prizeImg,
      alpha: 1,
      y: topY,
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

    return [displayPrizeBg, prizeImg, cardContainer];
  }
}
