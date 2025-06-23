import Phaser from "phaser";
import type { PrizeInfo } from "../model/lucky_draw_model";
import { PrizeCardComponent } from "./PrizeCardComponent";
import { createTitleStageLabel } from "./TitleStageLabel";

export class WinnerPanelComponent {
  static show(
    scene: Phaser.Scene,
    prizes: PrizeInfo[],
    onNext: () => void,
    title: string,
    subtitles: string[]
  ): Phaser.GameObjects.GameObject[] {
    const gameWidth = scene.scale.width;
    const gameHeight = scene.scale.height;

    const panelX = gameWidth * 0.25;
    const panelY = gameHeight / 2;
    const panelWidth = gameWidth * 0.5;
    const panelHeight = gameHeight;

    const columns = 4;
    const cardWidth = gameWidth * 0.11;
    const cardHeight = gameHeight * 0.058;
    const gap = gameWidth * 0.01;
    const labelHeight = gameHeight * 0.086;
    const spacingAfterLabel = gameHeight * 0.024;
    const spacingAfterGrid = gameHeight * 0.032;
    const btnHeight = gameHeight * 0.078;
    const nextBtnWidth = gameWidth * 0.085;

    const numRows =
      prizes.length === 1 ? 1 : Math.ceil(prizes.length / columns);
    const gridHeight =
      prizes.length === 1
        ? cardHeight
        : numRows * cardHeight + (numRows - 1) * gap;

    const contentHeight =
      labelHeight +
      spacingAfterLabel +
      gridHeight +
      spacingAfterGrid +
      btnHeight;

    let currY = panelY - contentHeight / 2;

    const blurImage = scene.add
      .image(panelX, panelY, "winner_blur_bg")
      .setOrigin(0.5)
      .setDisplaySize(panelWidth, panelHeight)
      .setDepth(1299)
      .setAlpha(1);

    const background2 = scene.add
      .image(gameWidth * 0.75, gameHeight / 2, "background2")
      .setOrigin(0.5)
      .setScale(1)
      .setDisplaySize(gameWidth * 0.5, gameHeight)
      .setDepth(9);

    const posterReward = scene.add
      .image(gameWidth * 0.75, gameHeight / 2, "PosterReward")
      .setOrigin(0.5)
      .setDisplaySize(516, 516)
      .setDepth(10);

    const stageLabel = createTitleStageLabel(
      scene,
      panelX,
      currY + labelHeight / 2,
      title,
      subtitles,
      {
        spacing: gameHeight * 0.012,
        depth: 1301,
      }
    );

    currY += labelHeight + spacingAfterLabel;

    const container = scene.add.container(0, 0).setDepth(1301).setAlpha(1);

    if (prizes.length === 1) {
      const card = PrizeCardComponent.create(
        scene,
        panelX,
        currY + cardHeight / 2,
        prizes[0],
        cardWidth,
        cardHeight
      );
      container.add(card);
    } else {
      const gridTotalWidth = cardWidth * columns + gap * (columns - 1);
      prizes.forEach((prize, idx) => {
        const col = idx % columns;
        const row = Math.floor(idx / columns);
        const x =
          panelX - gridTotalWidth / 2 + col * (cardWidth + gap) + cardWidth / 2;
        const y = currY + row * (cardHeight + gap) + cardHeight / 2;
        const card = PrizeCardComponent.create(
          scene,
          x,
          y,
          prize,
          cardWidth,
          cardHeight
        );
        container.add(card);
      });
    }

    currY += gridHeight + spacingAfterGrid;

    const nextBtnImage = scene.add
      .image(panelX, currY + btnHeight / 2, "Next")
      .setOrigin(0.5)
      .setDisplaySize(nextBtnWidth, btnHeight)
      .setDepth(1301)
      .setAlpha(1)
      .setScale(1)
      .setInteractive({ useHandCursor: true });

    const objects: Phaser.GameObjects.GameObject[] = [
      blurImage,
      background2,
      posterReward,
      stageLabel,
      container,
      nextBtnImage,
    ];
    container.iterate((child: any) => objects.push(child));

    nextBtnImage.on("pointerdown", () => {
      objects.forEach((g) => g.destroy());
      container.removeAll(true);
      if (onNext) onNext();
    });

    return objects;
  }
}
