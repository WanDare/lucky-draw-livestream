import Phaser from "phaser";
import type { PrizeInfo } from "../model/lucky_draw_model";
import { PrizeCardComponent } from "../components/PrizeCardComponent";
import {
  StagePrizeDisplayComponent,
  type StagePrizeConfig,
} from "../components/StagePrizeDisplayComponent";
import { CurtainComponent } from "../components/CurtainComponent";
import { PopupComponent } from "../components/PopupComponent";
import { DragMotionComponent } from "../components/DragMotionComponent";
import { LightshowFrameComponent } from "../components/LightshowFrameComponent";
import { WinnerPanelComponent } from "../components/WinnerPanelComponent";

export class LuckyDrawView {
  scene: Phaser.Scene;

  startButton!: Phaser.GameObjects.Image;
  background1!: Phaser.GameObjects.Image;
  background2!: Phaser.GameObjects.Image;
  gamescreen!: Phaser.GameObjects.Image | null;
  prizenet!: Phaser.GameObjects.Image | null;
  prizenetopen!: Phaser.GameObjects.Image | null;
  thumbnail!: Phaser.GameObjects.Image;
  curtainOpen!: Phaser.GameObjects.Image;
  curtainLeft!: Phaser.GameObjects.Image;
  curtainRight!: Phaser.GameObjects.Image;
  transitionOverlay!: Phaser.GameObjects.Rectangle | null;
  collectedPrizeGraphics: Phaser.GameObjects.Container[] = [];
  private stagePrizeGraphics: Phaser.GameObjects.GameObject[] = [];
  stageWinners: PrizeInfo[][] = []; // <-- store winners for each stage

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
      ["winner_blur_bg", "assets/images/blur.png"],
      ["Start", "assets/images/start_button.png"],
      ["Ball", "assets/images/ticket_prize.png"],
      ["Congrat", "assets/images/popup_winner.png"],
      ["Displayprize", "assets/images/display_prize.png"],
      ["Next", "assets/images/next_button.png"],
      ["Prize", "assets/images/prizes/prize7.png"],
      ["Prize2", "assets/images/prizes/prize6.png"],
      ["Prize3", "assets/images/prizes/prize5.png"],
      ["Curtain_left", "assets/motions/curtain_left.png"],
      ["Curtain_right", "assets/motions/curtain_right.png"],
      ["Curtainopen", "assets/motions/curtain_open.png"],
      ["lightshow1", "assets/motions/light_show1.png"],
      ["lightshow2", "assets/motions/light_show2.png"],
      ["lightshow3", "assets/motions/light_show3.png"],
      ["lightshow4", "assets/motions/light_show4.png"],
      ["Drag1", "assets/motions/drag1.png"],
      ["Drag2", "assets/motions/drag2.png"],
      ["Drag3", "assets/motions/drag3.png"],
      ["Prizenet", "assets/motions/net_close.png"],
      ["Prizenetopen", "assets/motions/net_open.png"],
    ];
    images.forEach(([key, path]) => this.scene.load.image(key, path as string));
  }

  reset() {
    // Call this at the start of a new game/session
    this.stageWinners = [];
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
      .setDepth(9);

    this.curtainLeft = this.scene.add
      .image(0, 512, "Curtain_left")
      .setOrigin(1, 0.5)
      .setDisplaySize(360, 1024)
      .setDepth(2)
      .setAlpha(1)
      .setVisible(false);

    this.scene.load.image("winner_blur_bg", "assets/images/winner_blur_bg.png");

    this.curtainRight = this.scene.add
      .image(720, 512, "Curtain_right")
      .setOrigin(0, 0.5)
      .setDisplaySize(420, 1024)
      .setDepth(2)
      .setAlpha(1)
      .setVisible(false);

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

  closeCurtain(onCloseDone?: () => void) {
    CurtainComponent.close(
      this.scene,
      this.curtainLeft,
      this.curtainRight,
      onCloseDone
    );
  }

  openCurtain(onOpenDone?: () => void) {
    CurtainComponent.open(
      this.scene,
      this.curtainLeft,
      this.curtainRight,
      onOpenDone
    );
  }

  runWithCurtain(action: () => void, curtainHoldMs = 0) {
    this.closeCurtain(() => {
      action();
      if (curtainHoldMs > 0) {
        setTimeout(() => this.openCurtain(), curtainHoldMs);
      } else {
        this.openCurtain();
      }
    });
  }

  showGameScreen(dropBalls: () => void) {
    this.transitionOverlay?.setAlpha(0);
    this.curtainLeft.setX(360).setVisible(true).setAlpha(1);
    this.curtainRight.setX(360).setVisible(true).setAlpha(1);

    LightshowFrameComponent.start(this.scene, 360, 70, {
      size: 260,
      depth: 5,
    });

    this.scene.tweens.add({
      targets: [this.curtainLeft, this.curtainRight],
      alpha: 1,
      duration: 0,
      onComplete: () => {
        this.openCurtain(() => {
          this.background1.setVisible(false);
          this.startButton.setVisible(false);
          this.thumbnail.setVisible(false);

          this.gamescreen = this.scene.add
            .image(360, 512, "Gamescreen")
            .setOrigin(0.5)
            .setDisplaySize(720, 1024)
            .setAlpha(1)
            .setDepth(2);

          this.prizenet = this.scene.add
            .image(360, 260, "Prizenet")
            .setOrigin(0.5)
            .setDisplaySize(720, 500)
            .setAlpha(1)
            .setDepth(3);

          this.transitionOverlay?.setAlpha(0);

          DragMotionComponent.create(this.scene, 360, 18, {
            size: 10,
            depth: 11,
            onDrop: dropBalls,
            onDragProgress: (progress) => {
              if (this.prizenet) {
                if (progress > 0.65) {
                  this.prizenet.setTexture("Prizenetopen");
                } else {
                  this.prizenet.setTexture("Prizenet");
                }
              }
            },
          });
        });
      },
    });
  }

  showStagePrize(prizeConfig: StagePrizeConfig) {
    this.stagePrizeGraphics.forEach((g) => g.destroy());
    this.stagePrizeGraphics = [];
    const objects = StagePrizeDisplayComponent.create(
      this.scene,
      this.background2,
      prizeConfig
    );
    this.stagePrizeGraphics.push(...objects);
  }

  showStageWinnersPanel(prizes: PrizeInfo[], onNext: () => void) {
    this.stagePrizeGraphics.forEach((g) => g.destroy());
    this.stagePrizeGraphics = WinnerPanelComponent.show(
      this.scene,
      prizes,
      onNext
    );
    // Store for summary panel at the end
    this.stageWinners.push([...prizes]);
  }

  showPrizeCongratulation(prize: PrizeInfo, onClose?: () => void) {
    PopupComponent.showCongrat(this.scene, prize, () => {
      if (this.onPopupClosed) this.onPopupClosed();
      if (onClose) onClose();
    });
  }

  showStageLabel(label: string) {
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

  showStageComplete(onDone: () => void) {
    PopupComponent.showTextOverlay(
      this.scene,
      "STAGE COMPLETE!",
      "#00ffae",
      onDone,
      false
    );
  }

  showGameComplete() {
    this.showGameCompleteSummary();
  }

  showGameCompleteSummary() {
    const panelX = 720;
    const panelY = 512;
    const panelWidth = 1440;
    const panelHeight = 1024;
    const objects: Phaser.GameObjects.GameObject[] = [];

    // Fullscreen blur
    const blurImage = this.scene.add
      .image(panelX, panelY, "winner_blur_bg")
      .setOrigin(0.5)
      .setDisplaySize(panelWidth, panelHeight)
      .setDepth(1500)
      .setAlpha(1);
    objects.push(blurImage);

    // Main title
    const title = this.scene.add
      .text(panelX, 110, "YOU WIN!", {
        font: "bold 60px Arial",
        color: "#FFD700",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(1502)
      .setAlpha(1);
    objects.push(title);

    // Stage summary sections (reverse order)
    const startY = 200;
    let currY = startY;
    const stageLabels = [
      "Stage 1 Winners",
      "Stage 2 Winners",
      "Final Stage Winners",
    ];

    // Reverse the stages for bottom-to-top display
    const reversedStages = [...this.stageWinners].reverse();

    reversedStages.forEach((stage, i) => {
      // Calculate the correct label index for reversed order
      const labelIndex = this.stageWinners.length - 1 - i;
      const label = this.scene.add
        .text(
          panelX,
          currY,
          stageLabels[labelIndex] ?? `Stage ${labelIndex + 1} Winners`,
          {
            font: "bold 36px Arial",
            color: "#ffffff",
            align: "center",
          }
        )
        .setOrigin(0.5)
        .setDepth(1502);
      objects.push(label);

      currY += 56;

      // Reverse the cards for each stage
      const reversedStage = [...stage].reverse();
      const columns = reversedStage.length;
      const cardSpacingX = 220;
      const totalWidth = (columns - 1) * cardSpacingX;
      const baseX = panelX - totalWidth / 2;
      const y = currY;

      reversedStage.forEach((prize, j) => {
        const x = baseX + j * cardSpacingX;
        const card = PrizeCardComponent.create(this.scene, x, y, prize);
        card.setDepth(1502);
        objects.push(card);
      });

      currY += 170;
    });

    // Close button
    // const closeBtn = this.scene.add
    //   .image(panelX, panelY + panelHeight / 2 - 80, "Next")
    //   .setOrigin(0.5)
    //   .setDisplaySize(180, 88)
    //   .setDepth(1502)
    //   .setInteractive({ useHandCursor: true });

    // objects.push(closeBtn);

    // closeBtn.on("pointerdown", () => {
    //   objects.forEach((g) => g.destroy());
    //   this.stageWinners = [];
    // });
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
      const card = PrizeCardComponent.create(this.scene, x, y, prize);
      this.collectedPrizeGraphics.push(card);
    });
  }
}
