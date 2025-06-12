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

const stageLabelImages = [
  "stage_label_giftbox",
  "stage_label_aojiru",
  "stage_label_iphone",
];

export class LuckyDrawView {
  scene: Phaser.Scene;

  startButton!: Phaser.GameObjects.Image;
  background1!: Phaser.GameObjects.Image;
  background2!: Phaser.GameObjects.Image;
  gamescreen!: Phaser.GameObjects.Image | null;
  prizenet!: Phaser.GameObjects.Image | null;
  prizenetopen!: Phaser.GameObjects.Image | null;
  people!: Phaser.GameObjects.Image | null;
  thumbnail!: Phaser.GameObjects.Image;
  curtainOpen!: Phaser.GameObjects.Image;
  curtainLeft!: Phaser.GameObjects.Image;
  curtainRight!: Phaser.GameObjects.Image;
  transitionOverlay!: Phaser.GameObjects.Rectangle | null;
  collectedPrizeGraphics: Phaser.GameObjects.Container[] = [];
  stageWinners: PrizeInfo[][] = [];
  private stagePrizeGraphics: Phaser.GameObjects.GameObject[] = [];
  private isStartButtonDisabled = false;
  private isNetOpen = false;
  private isNetSliding = false;

  onStart?: () => void;
  onPopupClosed?: () => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  preload() {
    const images = [
      ["background1", "assets/images/poster_thumbnail.png"],
      ["background2", "assets/images/streaming_background.png"],
      ["Thumbnail", "assets/images/thumbnail.png"],
      ["Poster", "assets/images/poster.png"],
      ["Gamescreen", "assets/images/lucky_game_main_bg.png"],
      ["winner_blur_bg", "assets/images/blur2.png"],
      ["Start", "assets/images/start_button.png"],
      ["Ball", "assets/images/ticket_prize.png"],
      ["Congrat", "assets/images/popup_winner_screen.png"],
      ["DragText", "assets/images/drag_text.png"],
      ["card_bg", "assets/images/display_winner.png"],
      ["Displayprize", "assets/images/display_prize.png"],
      ["People", "assets/images/people.png"],
      ["Next", "assets/images/next_button.png"],
      ["Prize", "assets/images/prizes/prize7.png"],
      ["Prize2", "assets/images/prizes/prize6.png"],
      ["Prize3", "assets/images/prizes/prize8.png"],
      ["stage_label_iphone", "assets/images/stage_label_iphone.png"],
      ["stage_label_aojiru", "assets/images/stage_label_aojiro.png"],
      ["stage_label_giftbox", "assets/images/stage_label_giftbox.png"],
      // <<=== Game Motions ===>>
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
        // cursor: "url('/assets/images/cursor_hand.png'), pointer",
      });

    this.isStartButtonDisabled = false;
    this.startButton.on("pointerdown", () => {
      if (this.isStartButtonDisabled) return;
      this.isStartButtonDisabled = true;
      this.startButton.disableInteractive();

      if (this.onStart) this.onStart();
    });

    this.gamescreen = null;
    this.prizenet = null;
    this.people = null;

    this.transitionOverlay = this.scene.add
      .rectangle(720, 512, 1440, 1024, 0x000000, 1)
      .setDepth(100)
      .setAlpha(0);
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

  slideOutPeople(onDone?: () => void) {
    if (this.people && this.people.visible) {
      this.scene.tweens.add({
        targets: this.people,
        y: 1200,
        duration: 420,
        ease: "Cubic.easeIn",
        onComplete: () => {
          this.people?.setVisible(false);
          if (onDone) onDone();
        },
      });
    } else if (onDone) {
      onDone();
    }
  }

  showGameScreen(dropBalls: () => void) {
    this.transitionOverlay?.setAlpha(0);
    this.curtainLeft.setX(360).setVisible(true).setAlpha(1);
    this.curtainRight.setX(360).setVisible(true).setAlpha(1);

    LightshowFrameComponent.start(this.scene, 370, 70, {
      size: 260,
      depth: 5,
    });

    this.scene.tweens.add({
      targets: [this.curtainLeft, this.curtainRight],
      alpha: 1,
      duration: 0,
      onComplete: () => {
        this.closeCurtain(() => {
          this.background1.setVisible(false);
          this.startButton.setVisible(false);
          this.thumbnail.setVisible(false);

          this.gamescreen = this.scene.add
            .image(360, 512, "Gamescreen")
            .setOrigin(0.5)
            .setDisplaySize(720, 1024)
            .setAlpha(1)
            .setDepth(2);

          this.people = this.scene.add
            .image(360, 1200, "People")
            .setOrigin(0.5)
            .setDisplaySize(868, 300)
            .setAlpha(1)
            .setDepth(8)
            .setVisible(true);

          this.scene.tweens.add({
            targets: this.people,
            y: 950,
            duration: 520,
            ease: "Cubic.easeOut",
          });

          this.prizenet = this.scene.add
            .image(360, 220, "Prizenet")
            .setOrigin(0.5)
            .setDisplaySize(720, 500)
            .setAlpha(1)
            .setDepth(4);

          this.prizenetopen = this.scene.add
            .image(360, 220, "Prizenetopen")
            .setOrigin(0.5)
            .setDisplaySize(720, 500)
            .setAlpha(0)
            .setDepth(3);

          this.transitionOverlay?.setAlpha(0);

          DragMotionComponent.create(this.scene, 360, 18, {
            size: 10,
            depth: 6,
            onDrop: dropBalls,
            onDragProgress: (progress) => {
              if (!this.prizenet || !this.prizenetopen) return;

              if (progress > 0.65 && !this.isNetOpen && !this.isNetSliding) {
                this.isNetSliding = true;

                this.scene.tweens.add({
                  targets: this.prizenet,
                  y: 20,
                  alpha: 0,
                  duration: 350,
                  ease: "Cubic.easeIn",
                });

                this.scene.tweens.add({
                  targets: this.prizenetopen,
                  alpha: 1,
                  duration: 350,
                  ease: "Cubic.easeIn",
                  onComplete: () => {
                    this.isNetOpen = true;
                    this.isNetSliding = false;
                  },
                });
              } else if (
                progress <= 0.65 &&
                this.isNetOpen &&
                !this.isNetSliding
              ) {
                this.isNetSliding = true;

                this.scene.tweens.add({
                  targets: this.prizenet,
                  y: 20,
                  alpha: 1,
                  duration: 350,
                  ease: "Cubic.easeOut",
                });

                this.scene.tweens.add({
                  targets: this.prizenetopen,
                  alpha: 0,
                  duration: 350,
                  ease: "Cubic.easeOut",
                  onComplete: () => {
                    this.isNetOpen = false;
                    this.isNetSliding = false;
                  },
                });
              }
            },
          });

          this.openCurtain();
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

    const stageIdx = this.stageWinners.length;
    const stageLabelKey = stageLabelImages[stageIdx] || "stage_label_iphone";

    this.stagePrizeGraphics = WinnerPanelComponent.show(
      this.scene,
      prizes,
      () => {
        this.stagePrizeGraphics.forEach((g) => g.destroy());
        this.stagePrizeGraphics = [];
        onNext();
      },
      stageLabelKey
    );

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
      .text(360, 430, label, {
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
    const panelX = 360;
    const panelY = 512;
    const panelWidth = 720;
    const panelHeight = 1024;
    const objects: Phaser.GameObjects.GameObject[] = [];

    const blurImage = this.scene.add
      .image(panelX, panelY, "winner_blur_bg")
      .setOrigin(0.5)
      .setDisplaySize(panelWidth, panelHeight)
      .setDepth(1500)
      .setAlpha(1);
    objects.push(blurImage);

    const posterX = 1080;
    const posterY = 512;
    const posterImage = this.scene.add
      .image(posterX, posterY, "Poster")
      .setOrigin(0.5)
      .setDisplaySize(panelWidth, panelHeight)
      .setDepth(1501);
    objects.push(posterImage);

    const startY = 200;
    let currY = startY;
    const stageLabelImages = [
      "stage_label_iphone",
      "stage_label_aojiru",
      "stage_label_giftbox",
    ];

    const reversedStages = [...this.stageWinners].reverse();

    reversedStages.forEach((stage, i) => {
      const labelIndex = this.stageWinners.length - 1 - i;
      const labelImageKey = stageLabelImages[labelIndex];

      if (labelImageKey && this.scene.textures.exists(labelImageKey)) {
        const labelObj = this.scene.add
          .image(panelX, currY - 20, labelImageKey)
          .setOrigin(0.5)
          .setDepth(1502)
          .setDisplaySize(224, 88);
        objects.push(labelObj);
      }

      currY += 56;
      const COLUMNS = 4;
      const CARD_W = 157;
      const CARD_H = 49;
      const GAP_X = 10;
      const GAP_Y = 10;

      const cardsInStage = [...stage].reverse();

      cardsInStage.forEach((prize, idx) => {
        const col = idx % COLUMNS;
        const row = Math.floor(idx / COLUMNS);
        const gridWidth = COLUMNS * CARD_W + (COLUMNS - 1) * GAP_X;

        const x = panelX - gridWidth / 2 + col * (CARD_W + GAP_X) + CARD_W / 2;
        const y = currY + row * (CARD_H + GAP_Y) + CARD_H / 2;

        const card = PrizeCardComponent.create(
          this.scene,
          x,
          y,
          prize,
          CARD_W,
          CARD_H
        );
        card.setDepth(1502);
        objects.push(card);
      });

      const rows = Math.ceil(cardsInStage.length / COLUMNS);
      currY += rows * (CARD_H + GAP_Y) + 35;
    });
  }

  renderPrizePanel(prizes: PrizeInfo[]) {
    this.collectedPrizeGraphics.forEach((c) => c.destroy());
    this.collectedPrizeGraphics = [];

    const columns = 3;
    const cardWidth = 200;
    const cardHeight = 65;
    const gap = 10;
    const cardSpacingX = cardWidth + gap;
    const cardSpacingY = cardHeight + gap;

    const baseX = 870;
    const baseY = 320;

    prizes.forEach((prize, i) => {
      const col = i % columns;
      const row = Math.floor(i / columns);
      const x = baseX + col * cardSpacingX;
      const y = baseY + row * cardSpacingY;
      const card = PrizeCardComponent.create(
        this.scene,
        x,
        y,
        prize,
        cardWidth,
        cardHeight
      );
      this.collectedPrizeGraphics.push(card);
    });
  }
}
