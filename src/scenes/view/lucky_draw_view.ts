import Phaser from "phaser";
import type { PrizeInfo } from "../model/lucky_draw_model";
import { launchConfetti } from "../effects/confetti";

export type StagePrizeConfig = {
  image: string;
  name: string;
  value: string;
};

export class LuckyDrawView {
  scene: Phaser.Scene;
  startButton!: Phaser.GameObjects.Image;
  background1!: Phaser.GameObjects.Image;
  background2!: Phaser.GameObjects.Image;
  gamescreen!: Phaser.GameObjects.Image | null;
  prizenet!: Phaser.GameObjects.Image | null;
  thumbnail!: Phaser.GameObjects.Image;
  prizeitem!: Phaser.GameObjects.Image;
  displayprize!: Phaser.GameObjects.Image;
  transitionOverlay!: Phaser.GameObjects.Rectangle | null;
  collectedPrizeGraphics: Phaser.GameObjects.Container[] = [];
  private _congratsPopup?: Phaser.GameObjects.GameObject[];
  private stagePrizeGraphics: Phaser.GameObjects.GameObject[] = [];
  onStart?: () => void;
  onPopupClosed?: () => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  preload() {
    const images = [
      ["background1", "assets/images/poster_thumbnail.png"],
      ["background2", "assets/images/streaming_bg.png"],
      ["Thumbnail", "assets/images/thumbnail.png"],
      ["Gamescreen", "assets/images/lucky_game_bg.png"],
      ["Start", "assets/images/start_button.png"],
      ["Opennet", "assets/images/open_net.png"],
      ["Net", "assets/images/net.png"],
      ["Rope", "assets/images/rope.png"],
      ["Prizenet", "assets/images/prize_net.png"],
      ["Ball", "assets/images/ball_prize.png"],
      ["Congrat", "assets/images/popup_winner.png"],
      ["Displayprize", "assets/images/display_prize.png"],
      // Prize images
      ["Prize", "assets/images/prizes/prize7.png"],
      ["Prize2", "assets/images/prizes/prize6.png"],
      ["Prize3", "assets/images/prizes/prize5.png"],
    ];
    images.forEach(([key, path]) => this.scene.load.image(key, path as string));
  }

  createLayout(_centerX: number, _centerY: number) {
    this.background1 = this.scene.add
      .image(360, 512, "background1")
      .setOrigin(0.5)
      .setDisplaySize(720, 1024)
      .setDepth(-1);

    this.background2 = this.scene.add
      .image(1080, 512, "background2")
      .setOrigin(0.5)
      .setDisplaySize(720, 1024)
      .setDepth(-1);

    this.thumbnail = this.scene.add
      .image(360, 512, "Thumbnail")
      .setOrigin(0.5)
      .setDisplaySize(516, 728)
      .setDepth(1);

    this.startButton = this.scene.add
      .image(360, 960, "Start")
      .setOrigin(0.5)
      .setDisplaySize(150, 80)
      .setDepth(1)
      .setInteractive({
        useHandCursor: false,
        cursor: "url('/assets/images/cursor_hand.png'), pointer",
      });

    this.gamescreen = null;
    this.prizenet = null;

    this.transitionOverlay = this.scene.add
      .rectangle(720, 512, 1440, 1024, 0x000000, 1)
      .setDepth(100)
      .setAlpha(0);

    this.startButton.on("pointerdown", () => {
      if (this.onStart) this.onStart();
    });
  }

  showStagePrize(prizeConfig: { image: string; name: string; value: string }) {
    this.stagePrizeGraphics.forEach((g) => g.destroy());
    this.stagePrizeGraphics = [];

    const centerX = this.background2.x;
    const topY = this.background2.y - this.background2.displayHeight / 2 + 30;

    // --- 1. Displayprize background ---
    const displayPrizeBg = this.scene.add
      .image(centerX, topY + 110, "Displayprize")
      .setOrigin(0.5, 0)
      .setDisplaySize(345, 114)
      .setAlpha(0)
      .setDepth(this.background2.depth + 1);

    // --- 2. Prize image ---
    const prizeImg = this.scene.add
      .image(centerX, topY + 42, prizeConfig.image)
      .setOrigin(0.5, 0)
      .setDisplaySize(163, 95)
      .setAlpha(0)
      .setDepth(this.background2.depth + 2);

    // --- 3. Mini Card for Prize Name and Value ---
    const cardWidth = 200;
    const cardHeight = 64;
    const borderRadius = 14;
    const cardY = topY + 160;

    const cardBg = this.scene.add.graphics();
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
    cardBg.setDepth(this.background2.depth + 3);

    const nameText = this.scene.add
      .text(0, 25, prizeConfig.name, {
        font: "bold 12px Arial",
        color: "#ffffff",
        align: "center",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const valueText = this.scene.add
      .text(0, 45, prizeConfig.value, {
        font: "bold 12px Arial",
        color: "#FFD700",
        align: "center",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const cardContainer = this.scene.add.container(centerX, cardY, [
      cardBg,
      nameText,
      valueText,
    ]);
    cardContainer.setDepth(this.background2.depth + 4);
    cardContainer.setScale(0.7).setAlpha(0);

    this.scene.tweens.add({
      targets: displayPrizeBg,
      alpha: 1,
      duration: 350,
      ease: "Back.Out",
    });
    this.scene.tweens.add({
      targets: prizeImg,
      alpha: 1,
      y: topY + 35,
      duration: 360,
      delay: 100,
      ease: "Back.Out",
    });
    this.scene.tweens.add({
      targets: cardContainer,
      alpha: 1,
      scale: 1,
      duration: 350,
      delay: 180,
      ease: "Back.Out",
    });
    this.scene.tweens.add({
      targets: cardBg,
      alpha: 1,
      duration: 350,
      delay: 180,
      ease: "Back.Out",
    });

    this.stagePrizeGraphics.push(
      displayPrizeBg,
      prizeImg,
      cardContainer,
      cardBg
    );
  }

  showStageWinnersPanel(prizes: PrizeInfo[], onNext: () => void) {
    this.stagePrizeGraphics.forEach((g) => g.destroy());
    this.stagePrizeGraphics = [];

    const { width, height } = this.scene.scale;
    // Make panel much bigger
    const panelWidth = 850;
    const panelHeight = 850;

    const overlay = this.scene.add
      .rectangle(width / 2, height / 2, width, height, 0x000000, 0.75)
      .setDepth(300)
      .setAlpha(0);

    const panelRadius = 32;
    const panelGraphics = this.scene.add.graphics();
    panelGraphics.fillStyle(0x222b1c, 1);
    panelGraphics.lineStyle(3, 0xf9ffb2, 1);
    panelGraphics.strokeRoundedRect(0, 0, panelWidth, panelHeight, panelRadius);
    panelGraphics.fillRoundedRect(0, 0, panelWidth, panelHeight, panelRadius);

    // Generate texture and create image
    const panelTexKey = "stageWinnersPanelBg";
    panelGraphics.generateTexture(panelTexKey, panelWidth, panelHeight);
    panelGraphics.destroy();

    const panel = this.scene.add
      .image(width / 2, height / 2, panelTexKey)
      .setDisplaySize(panelWidth, panelHeight)
      .setDepth(301)
      .setAlpha(0);

    // Title higher up
    const title = this.scene.add
      .text(width / 2, height / 2 - panelHeight / 2 + 50, "Stage Winners", {
        font: "bold 40px Arial",
        color: "#FFD700",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(302)
      .setAlpha(0);

    // ---- GRID LOGIC ----
    const columns = 3;
    const cardSpacingX = 250;
    const cardSpacingY = 85;
    const gridTotalWidth = cardSpacingX * (columns - 1);
    const startX = width / 2 - gridTotalWidth / 2;
    const startY = height / 2 - 160;

    const container = this.scene.add.container(0, 0).setDepth(303).setAlpha(0);

    prizes.forEach((prize, idx) => {
      const col = idx % columns;
      const row = Math.floor(idx / columns);
      const x = startX + col * cardSpacingX;
      const y = startY + row * cardSpacingY;
      const card = this.createPrizeCard(x, y, prize);
      container.add(card);
    });

    // Next button lower down
    const nextBtnY = height / 2 + panelHeight / 2 - 54;
    // Use graphics for rounded rectangle button
    const nextBtnGraphics = this.scene.add.graphics();
    const btnWidth = 210;
    const btnHeight = 62;
    const btnRadius = 18;
    nextBtnGraphics.fillStyle(0xf9ffb2, 1);
    nextBtnGraphics.fillRoundedRect(
      -btnWidth / 2,
      -btnHeight / 2,
      btnWidth,
      btnHeight,
      btnRadius
    );
    nextBtnGraphics.lineStyle(3, 0x214e16, 1);
    nextBtnGraphics.strokeRoundedRect(
      -btnWidth / 2,
      -btnHeight / 2,
      btnWidth,
      btnHeight,
      btnRadius
    );
    nextBtnGraphics.setPosition(width / 2, nextBtnY);
    nextBtnGraphics.setDepth(304).setAlpha(0);

    // Use a transparent rectangle for interaction
    const nextBtn = this.scene.add
      .rectangle(width / 2, nextBtnY, btnWidth, btnHeight, 0x000000, 0)
      .setDepth(305)
      .setAlpha(0)
      .setInteractive({ useHandCursor: true });

    const nextText = this.scene.add
      .text(width / 2, nextBtnY, "Next", {
      font: "bold 32px Arial",
      color: "#214e16",
      align: "center",
      })
      .setOrigin(0.5)
      .setDepth(306)
      .setAlpha(0);

    this.scene.tweens.add({
      targets: [overlay, panel, title, container, nextBtnGraphics, nextBtn, nextText],
      alpha: 1,
      duration: 350,
      ease: "Back.Out",
    });

    this.stagePrizeGraphics.push(
      overlay,
      panel,
      title,
      container,
      nextBtnGraphics,
      nextBtn,
      nextText
    );
    container.iterate((child: any) => this.stagePrizeGraphics.push(child));

    nextBtn.on("pointerdown", () => {
      this.scene.tweens.add({
      targets: [overlay, panel, title, container, nextBtnGraphics, nextBtn, nextText],
      alpha: 0,
      duration: 250,
      onComplete: () => {
        [overlay, panel, title, container, nextBtnGraphics, nextBtn, nextText].forEach((g) =>
        g.destroy()
        );
        container.removeAll(true);
        this.stagePrizeGraphics = [];
        if (onNext) onNext();
      },
      });
    });
  }

  showGameScreen(dropBalls: () => void) {
    this.transitionOverlay?.setAlpha(0);
    this.scene.tweens.add({
      targets: this.transitionOverlay,
      alpha: 1,
      duration: 400,
      onComplete: () => {
        this.background1.setVisible(false);
        this.startButton.setVisible(false);
        this.thumbnail.setVisible(false);

        this.gamescreen = this.scene.add
          .image(360, 512, "Gamescreen")
          .setOrigin(0.5)
          .setDisplaySize(720, 1024)
          .setAlpha(0)
          .setDepth(2);

        this.scene.tweens.add({
          targets: this.gamescreen,
          alpha: 1,
          duration: 400,
          ease: "Quad.easeIn",
        });

        this.prizenet = this.scene.add
          .image(360, 150, "Prizenet")
          .setOrigin(0.5)
          .setDisplaySize(790, 660)
          .setDepth(3);

        this.scene.tweens.add({
          targets: this.transitionOverlay,
          alpha: 0,
          duration: 200,
          onComplete: dropBalls,
        });
      },
    });
  }

  showStageLabel?(label: string) {
    const text = this.scene.add
      .text(720, 80, label, {
        font: "bold 38px Arial",
        color: "#fff080",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(200);
    this.scene.tweens.add({
      targets: text,
      alpha: 0,
      delay: 1200,
      duration: 400,
      onComplete: () => text.destroy(),
    });
  }

  showStageComplete?(onDone: () => void) {
    const overlay = this.scene.add
      .rectangle(720, 512, 1440, 1024, 0x000000, 0.7)
      .setDepth(250)
      .setAlpha(0);

    const text = this.scene.add
      .text(720, 512, "STAGE COMPLETE!", {
        font: "bold 54px Arial",
        color: "#00ffae",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(251)
      .setAlpha(0);

    this.scene.tweens.add({
      targets: [overlay, text],
      alpha: 1,
      duration: 300,
      ease: "Quad.easeIn",
      onComplete: () => {
        this.scene.time.delayedCall(1000, () => {
          this.scene.tweens.add({
            targets: [overlay, text],
            alpha: 0,
            duration: 350,
            onComplete: () => {
              overlay.destroy();
              text.destroy();
              onDone();
            },
          });
        });
      },
    });
  }

  showGameComplete?() {
    const overlay = this.scene.add
      .rectangle(720, 512, 1440, 1024, 0x000000, 0.7)
      .setDepth(250)
      .setAlpha(0);

    const text = this.scene.add
      .text(720, 512, "YOU WIN!", {
        font: "bold 60px Arial",
        color: "#FFD700",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(251)
      .setAlpha(0);

    this.scene.tweens.add({
      targets: [overlay, text],
      alpha: 1,
      duration: 350,
      ease: "Quad.easeIn",
      onComplete: () => {
        launchConfetti(this.scene, { x: 720, y: 512, amount: 70 });
        // Optional: Repeat confetti a couple of times for extra celebration
        this.scene.time.delayedCall(600, () => {
          launchConfetti(this.scene, { x: 720, y: 412, amount: 48 });
        });
      },
    });
  }

  showPrizeCongratulation(prize: PrizeInfo, onClose?: () => void) {
    if (this._congratsPopup) return;

    const { width, height } = this.scene.scale;

    const overlay = this.scene.add
      .rectangle(360, 512, 720, 1024, 0x000000, 0.48)
      .setDepth(300)
      .setAlpha(0);

    const popup = this.scene.add
      .image(width / 2, height / 2, "Congrat")
      .setOrigin(0.5)
      .setDisplaySize(width, height)
      .setDepth(301)
      .setAlpha(0);

    const nameText = this.scene.add
      .text(width / 2, height - 490, prize.name, {
        font: "bold 16px Arial",
        color: "#fff",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(301)
      .setAlpha(0);

    const phoneText = this.scene.add
      .text(width / 2, height - 460, prize.phone, {
        font: "bold 26px Arial",
        color: "#fff",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(301)
      .setAlpha(0);

    this._congratsPopup = [overlay, popup, nameText, phoneText];

    this.scene.tweens.add({
      targets: [overlay, popup, nameText, phoneText],
      alpha: 1,
      duration: 300,
      ease: "Quad.easeOut",
      onComplete: () => {
        let closed = false;
        const closePopup = () => {
          if (closed) return;
          closed = true;
          this.scene.tweens.add({
            targets: [overlay, popup, nameText, phoneText],
            alpha: 0,
            duration: 350,
            onComplete: () => {
              this._congratsPopup?.forEach((obj) => obj.destroy());
              this._congratsPopup = undefined;
              if (this.onPopupClosed) this.onPopupClosed();
              if (onClose) onClose();
            },
          });
        };

        overlay.setInteractive({ useHandCursor: true });
        popup.setInteractive({ useHandCursor: true });
        overlay.once("pointerdown", closePopup);
        popup.once("pointerdown", closePopup);
        this.scene.time.delayedCall(3000, closePopup);
      },
    });
  }

  renderPrizePanel(prizes: PrizeInfo[]) {
    this.collectedPrizeGraphics.forEach((c) => c.destroy());
    this.collectedPrizeGraphics = [];

    const columns = 3;
    const cardSpacingX = 240;
    const cardSpacingY = 85;
    const baseX = 840;
    const baseY = 350;

    prizes.forEach((prize, i) => {
      const col = i % columns;
      const row = Math.floor(i / columns);
      const x = baseX + col * cardSpacingX;
      const y = baseY + row * cardSpacingY;
      const card = this.createPrizeCard(x, y, prize);
      this.collectedPrizeGraphics.push(card);
    });
  }

  createPrizeCard(
    x: number,
    y: number,
    prize: PrizeInfo
  ): Phaser.GameObjects.Container {
    const width = 209;
    const height = 65;
    const borderRadius = 16;

    const cardBg = this.scene.add.graphics();
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

    const nameText = this.scene.add
      .text(0, -13, prize.name, {
        font: "bold 18px Arial",
        color: "#ffffff",
        align: "center",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const phoneText = this.scene.add
      .text(0, 15, prize.phone, {
        font: "bold 20px Arial",
        color: "#ffffff",
        align: "center",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const container = this.scene.add.container(x, y, [
      cardBg,
      nameText,
      phoneText,
    ]);
    container.setDepth(22);

    container.setScale(0.7).setAlpha(0);
    this.scene.tweens.add({
      targets: container,
      alpha: 1,
      scale: 1,
      duration: 200,
      ease: "Back.Out",
    });

    return container;
  }
}
