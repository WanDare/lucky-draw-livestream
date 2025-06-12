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

    const blurImage = scene.add
      .image(panelX, panelY, "winner_blur_bg")
      .setOrigin(0.5)
      .setDisplaySize(panelWidth, panelHeight)
      .setDepth(1299)
      .setAlpha(1);

    const stageLabelImage = scene.add
      .image(panelX, panelY - panelHeight / 2 + 130, stageLabelKey)
      .setOrigin(0.5)
      .setDisplaySize(224, 88)
      .setDepth(1301)
      .setAlpha(1);

    const columns = 3;
    const cardWidth = 200;
    const cardHeight = 65;
    const gap = 15;

    const cardSpacingX = cardWidth + gap;
    const cardSpacingY = cardHeight + gap;
    const gridTotalWidth = cardSpacingX * (columns - 1);

    const numRows = Math.ceil(prizes.length / columns);
    const verticalPadding = 40;

    const containerY = panelY - 60 - verticalPadding;
    const startX = panelX - gridTotalWidth / 2;
    const startY = verticalPadding;

    const container = scene.add
      .container(0, containerY)
      .setDepth(1301)
      .setAlpha(1);

    prizes.forEach((prize, idx) => {
      const col = idx % columns;
      const row = Math.floor(idx / columns);
      const x = startX + col * cardSpacingX;
      const y = startY + row * cardSpacingY;
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

    const nextBtnY = panelY + panelHeight / 2 - 54;
    const nextBtnImage = scene.add
      .image(panelX, nextBtnY, "Next")
      .setOrigin(0.5)
      .setDisplaySize(150, 80)
      .setDepth(1301)
      .setAlpha(1)
      .setInteractive({ useHandCursor: true });

    const posterX = 1080; 
    const posterY = 512;
    const posterImage = scene.add
      .image(posterX, posterY, "Poster")
      .setOrigin(0.5)
      .setDisplaySize(panelWidth, panelHeight) 
      .setDepth(1301);

    const objects: Phaser.GameObjects.GameObject[] = [
      blurImage,
      stageLabelImage,
      container,
      nextBtnImage,
      posterImage, 
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
