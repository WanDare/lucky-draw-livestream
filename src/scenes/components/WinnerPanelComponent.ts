import Phaser from "phaser";
import type { PrizeInfo } from "../model/lucky_draw_model";
import { PrizeCardComponent } from "./PrizeCardComponent";

export class WinnerPanelComponent {
  static show(
    scene: Phaser.Scene,
    prizes: PrizeInfo[],
    onNext: () => void,
    stageLabelKey: string
  ): Phaser.GameObjects.GameObject[] {
    const panelX = 360;
    const panelY = 512;
    const panelWidth = 720;
    const panelHeight = 1024;

    const columns = 3;
    const cardWidth = 200;
    const cardHeight = 65;
    const gap = 15;
    const labelHeight = 88;
    const labelWidth = 224;
    const spacingAfterLabel = 24;
    const spacingAfterGrid = 32;
    const btnHeight = 80;

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

    const posterX = 1080;
    const posterY = 512;
    const posterImage = scene.add
      .image(posterX, posterY, "Poster")
      .setOrigin(0.5)
      .setDisplaySize(panelWidth, panelHeight)
      .setDepth(1301);

    const stageLabelImage = scene.add
      .image(panelX, currY + labelHeight / 2, stageLabelKey)
      .setOrigin(0.5)
      .setDisplaySize(labelWidth, labelHeight)
      .setDepth(1301)
      .setAlpha(1);

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
      .setDisplaySize(150, btnHeight)
      .setDepth(1301)
      .setAlpha(1)
      .setInteractive({ useHandCursor: true });

    const objects: Phaser.GameObjects.GameObject[] = [
      blurImage,
      posterImage,
      stageLabelImage,
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
