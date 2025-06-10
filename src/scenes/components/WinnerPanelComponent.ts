// components/WinnerPanelComponent.ts
import Phaser from "phaser";
import type { PrizeInfo } from "../model/lucky_draw_model";
import { PrizeCardComponent } from "./PrizeCardComponent";

export class WinnerPanelComponent {
  static show(
    scene: Phaser.Scene,
    prizes: PrizeInfo[],
    onNext: () => void
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

    const title = scene.add
      .text(panelX, panelY - panelHeight / 2 + 280, "Stage Winners", {
        font: "bold 40px Arial",
        color: "#FFD700",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(1301)
      .setAlpha(1);

    const columns = 3;
    const cardSpacingX = 220;
    const cardSpacingY = 90;
    const gridTotalWidth = cardSpacingX * (columns - 1);
    const startX = panelX - gridTotalWidth / 2;
    const startY = panelY - 120;

    const container = scene.add.container(0, 0).setDepth(1301).setAlpha(1);

    prizes.forEach((prize, idx) => {
      const col = idx % columns;
      const row = Math.floor(idx / columns);
      const x = startX + col * cardSpacingX;
      const y = startY + row * cardSpacingY;
      const card = PrizeCardComponent.create(scene, x, y, prize);
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

    const objects: Phaser.GameObjects.GameObject[] = [
      blurImage,
      title,
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
