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
import {
  createTitleStageLabel,
  type TitlePart,
} from "../components/TitleStageLabel";

const stageTitles = [
  "អបអរសាទរអ្នកឈ្នះរង្វាន់",
  "អបអរសាទរអ្នកឈ្នះរង្វាន់",
  "អបអរសាទរអ្នកឈ្នះរង្វាន់",
];
const stageTitlesLevel = [
  "វគ្គទី ១: ស្វែងរកអ្នកឈ្នះរង្វាន់",
  "វគ្គទី ២: ស្វែងរកអ្នកឈ្នះរង្វាន់ ",
  "វគ្គទី ៣: ស្វែងរកអ្នកឈ្នះរង្វាន់ ",
];
const subtitles = [
  ["កាបូប Sakkin ចំនួន ២៤នាក់"],
  ["ការញ្ញំា ស្តេចចាហួយសុខភាពរយៈពេល ១ឆ្នាំ (១២ប្រអប់)"],
  ["Iphone 16 Pro Max ចំនួន 1 នាក់"],
];

export const stageTitleImages = ["Stage1", "Stage2", "Stage3"];

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
      // Core and Background Images
      ["background1", "assets/images/poster_thumbnail.png"],
      ["background2", "assets/images/streaming_background.png"],
      ["Thumbnail", "assets/images/thumbnail.png"],
      ["Poster", "assets/images/poster.png"],
      ["Pause", "assets/images/game_pause.png"],
      ["Gamescreen", "assets/images/lucky_game_main_bg.png"],
      ["winner_blur_bg", "assets/images/Blur3.png"],
      ["Ball", "assets/images/ticket_prize.png"],
      ["Congrat", "assets/images/popup_winner_screen.png"],
      ["card_bg", "assets/images/display_winner.png"],
      ["Prize_card", "assets/images/price_cardbg.png"],
      ["Displayprize", "assets/images/display_prize.png"],
      ["People", "assets/images/people.png"],
      // Button
      ["Start", "assets/images/start_button.png"],
      ["Next", "assets/images/next_button.png"],
      ["BackMenu", "assets/images/back_to_menu.png"],
      // Display Prizes item
      ["Prize", "assets/images/prizes/prize7.png"],
      ["Prize2", "assets/images/prizes/prize6.png"],
      ["Prize3", "assets/images/prizes/prize8.png"],
      // Title & Text
      ["Stage1", "assets/images/stage1.png"],
      ["Stage2", "assets/images/stage2.png"],
      ["Stage3", "assets/images/stage3.png"],
      ["stage_label_iphone", "assets/images/stage_label_iphone.png"],
      ["stage_label_aojiru", "assets/images/stage_label_aojiro.png"],
      ["stage_label_giftbox", "assets/images/stage_label_giftbox.png"],
      ["DragText", "assets/images/drag_text.png"],
      // Game Object Motions
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
    const gameWidth = this.scene.scale.width;
    const gameHeight = this.scene.scale.height;

    this.background1 = this.scene.add
      .image(gameWidth * 0.25, gameHeight / 2, "background1")
      .setOrigin(0.5)
      .setScale(1)
      .setDisplaySize(gameWidth * 0.5, gameHeight)
      .setDepth(-1);

    this.background2 = this.scene.add
      .image(gameWidth * 0.75, gameHeight / 2, "background2")
      .setOrigin(0.5)
      .setScale(1)
      .setDisplaySize(gameWidth * 0.5, gameHeight)
      .setDepth(9);

    this.curtainLeft = this.scene.add
      .image(0, gameHeight / 2, "Curtain_left")
      .setOrigin(1, 0.5)
      .setDisplaySize(gameWidth * 0.25, gameHeight)
      .setDepth(2)
      .setAlpha(1)
      .setVisible(false);

    this.curtainRight = this.scene.add
      .image(gameWidth / 2, gameHeight / 2, "Curtain_right")
      .setOrigin(0, 0.5)
      .setDisplaySize(gameWidth * 0.29, gameHeight)
      .setDepth(2)
      .setAlpha(1)
      .setVisible(false);

    this.thumbnail = this.scene.add
      .image(gameWidth * 0.25, gameHeight / 2, "Thumbnail")
      .setOrigin(0.5)
      .setDisplaySize(gameWidth * 0.36, gameHeight * 0.71)
      .setDepth(1);

    this.startButton = this.scene.add
      .image(gameWidth * 0.25, gameHeight * 0.94, "Start")
      .setOrigin(0.5)
      .setDisplaySize(gameWidth * 0.1, gameHeight * 0.08)
      .setDepth(1)
      .setScale(1)
      .setInteractive({ useHandCursor: false });

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
      .rectangle(
        gameWidth / 2,
        gameHeight / 2,
        gameWidth,
        gameHeight,
        0x000000,
        1
      )
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
        y: this.scene.scale.height * 1.2,
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
    const gameWidth = this.scene.scale.width;
    const gameHeight = this.scene.scale.height;

    this.transitionOverlay?.setAlpha(0);
    this.curtainLeft
      .setX(gameWidth * 0.25)
      .setVisible(true)
      .setAlpha(1);
    this.curtainRight
      .setX(gameWidth * 0.25)
      .setVisible(true)
      .setAlpha(1);

    LightshowFrameComponent.start(
      this.scene,
      gameWidth * 0.257,
      gameHeight * 0.07,
      {
        size: gameWidth * 0.18,
        depth: 5,
      }
    );

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
            .image(gameWidth * 0.25, gameHeight / 2, "Gamescreen")
            .setOrigin(0.5)
            .setDisplaySize(gameWidth * 0.5, gameHeight)
            .setAlpha(1)
            .setDepth(2);

          this.people = this.scene.add
            .image(gameWidth * 0.25, gameHeight * 1.17, "People")
            .setOrigin(0.5)
            .setDisplaySize(gameWidth * 0.6, gameHeight * 0.29)
            .setAlpha(1)
            .setDepth(8)
            .setVisible(true);

          this.scene.tweens.add({
            targets: this.people,
            y: gameHeight * 0.94,
            duration: 520,
            ease: "Cubic.easeOut",
          });

          this.prizenet = this.scene.add
            .image(gameWidth * 0.25, gameHeight * 0.21, "Prizenet")
            .setOrigin(0.5)
            .setDisplaySize(gameWidth * 0.5, gameHeight * 0.49)
            .setAlpha(1)
            .setDepth(4);

          this.prizenetopen = this.scene.add
            .image(gameWidth * 0.25, gameHeight * 0.21, "Prizenetopen")
            .setOrigin(0.5)
            .setDisplaySize(gameWidth * 0.5, gameHeight * 0.49)
            .setAlpha(0)
            .setDepth(3);

          this.transitionOverlay?.setAlpha(0);

          DragMotionComponent.create(
            this.scene,
            gameWidth * 0.25,
            gameHeight * 0.018,
            {
              size: gameWidth * 0.007,
              depth: 6,
              onDrop: dropBalls,
              onDragProgress: (progress) => {
                if (!this.prizenet || !this.prizenetopen) return;

                if (progress > 0.65 && !this.isNetOpen && !this.isNetSliding) {
                  this.isNetSliding = true;

                  this.scene.tweens.add({
                    targets: this.prizenet,
                    y: gameHeight * 0.02,
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
                    y: gameHeight * 0.02,
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
            }
          );

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

    const title = stageTitles[stageIdx] || "";
    const stageSubtitles = subtitles[stageIdx] || [];

    this.stagePrizeGraphics = WinnerPanelComponent.show(
      this.scene,
      prizes,
      () => {
        this.stagePrizeGraphics.forEach((g) => g.destroy());
        this.stagePrizeGraphics = [];
        onNext();
      },
      title,
      stageSubtitles
    );

    this.stageWinners.push([...prizes]);
  }

  showPrizeCongratulation(prize: PrizeInfo, onClose?: () => void) {
    PopupComponent.showCongrat(this.scene, prize, () => {
      if (this.onPopupClosed) this.onPopupClosed();
      if (onClose) onClose();
    });
  }

  showStageLabel(stageIdx: number) {
    const gameWidth = this.scene.scale.width;
    const gameHeight = this.scene.scale.height;
    const titleText = stageTitlesLevel[stageIdx] || "";
    const subs = subtitles[stageIdx] || [];

    const gradientColors = [
      "#FFF7D5", // left
      "#FFFFFF", // middle
      "#FDF5DB", // right
    ];

    const titleLines: TitlePart[] = [
      {
        text: titleText,
        fontSize: 28,
        fontStyle: "bold",
        fontFamily: "Kantumruy Pro",
        stroke: "#765934",
        strokeThickness: 2,
        shadow: {
          offsetX: 1,
          offsetY: 2,
          color: "#765934",
          blur: 0,
          stroke: true,
          fill: true,
        },
        gradientColors,
      },
    ];

    const label = createTitleStageLabel(
      this.scene,
      gameWidth * 0.25,
      gameHeight * 0.42,
      titleLines,
      subs,
      {
        width: gameWidth * 0.22,
        spacing: gameHeight * 0.005,
        titleFontSize: 28,
        subtitleFontSize: 16,
        gradientColors: gradientColors,
        depth: 200,
      }
    );

    this.scene.tweens.add({
      targets: label,
      alpha: 0,
      delay: 1200,
      duration: 400,
      onComplete: () => label.destroy(),
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
    const gameWidth = this.scene.scale.width;
    const gameHeight = this.scene.scale.height;

    const panelX = gameWidth * 0.25;
    const panelY = gameHeight / 2;
    const panelWidth = gameWidth * 0.5;
    const panelHeight = gameHeight;
    const objects: Phaser.GameObjects.GameObject[] = [];

    const blurImage = this.scene.add
      .image(panelX, panelY, "winner_blur_bg")
      .setOrigin(0.5)
      .setDisplaySize(panelWidth, panelHeight)
      .setDepth(1500)
      .setAlpha(1);
    objects.push(blurImage);

    const posterX = gameWidth * 0.75;
    const posterY = gameHeight / 2;
    const posterImage = this.scene.add
      .image(posterX, posterY, "Poster")
      .setOrigin(0.5)
      .setDisplaySize(panelWidth, panelHeight)
      .setDepth(1501);
    objects.push(posterImage);

    const labelHeight = gameHeight * 0.086;
    const spacingAfterLabel = gameHeight * 0.014;
    const stageBlockPaddingY = gameHeight * 0.035;
    const CARD_W = gameWidth * 0.11;
    const CARD_H = gameHeight * 0.058;
    const GAP_X = gameWidth * 0.007;
    const GAP_Y = gameHeight * 0.01;
    const COLUMNS = 4;

    let currY = gameHeight * 0.034;

    const reversedStages = [...this.stageWinners].reverse();

    reversedStages.forEach((stage, i) => {
      const labelIndex = this.stageWinners.length - 1 - i;
      const titleText = stageTitles[labelIndex] || "";
      const subs = subtitles[labelIndex] || [];
      const titleLines: TitlePart[] = [
        {
          text: titleText,
          fontSize: 28,
          fontStyle: "bold",
          fontFamily: "Kantumruy Pro",
          stroke: "#765934",
          strokeThickness: 2,
          shadow: {
            offsetX: 1,
            offsetY: 2,
            color: "#765934",
            blur: 0,
            stroke: true,
            fill: true,
          },
        },
      ];

      const labelObj = createTitleStageLabel(
        this.scene,
        panelX,
        currY + labelHeight / 2 - 10,
        titleLines,
        subs,
        {
          width: panelWidth * 0.9,
          spacing: gameHeight * 0.01,
          titleFontSize: 28,
          subtitleFontSize: 18,
          gradientColors: ["#FFF7D5", "#FFFFFF", "#FDF5DB"],
          depth: 1502,
        }
      );
      objects.push(labelObj);
      currY += labelObj.height + spacingAfterLabel;

      // --- Cards ---
      const cardsInStage = [...stage].reverse();
      const numCards = cardsInStage.length;

      if (numCards === 1) {
        const card = PrizeCardComponent.create(
          this.scene,
          panelX,
          currY + CARD_H / 2,
          cardsInStage[0],
          CARD_W,
          CARD_H
        );
        card.setDepth(1502);
        objects.push(card);

        currY += CARD_H;
      } else if (numCards > 1) {
        const rows = Math.ceil(numCards / COLUMNS);
        const gridHeight = rows * CARD_H + (rows - 1) * GAP_Y;
        const gridWidth = COLUMNS * CARD_W + (COLUMNS - 1) * GAP_X;

        for (let idx = 0; idx < numCards; idx++) {
          const col = idx % COLUMNS;
          const row = Math.floor(idx / COLUMNS);
          const x =
            panelX - gridWidth / 2 + col * (CARD_W + GAP_X) + CARD_W / 2;
          const y = currY + row * (CARD_H + GAP_Y) + CARD_H / 2;
          const card = PrizeCardComponent.create(
            this.scene,
            x,
            y,
            cardsInStage[idx],
            CARD_W,
            CARD_H
          );
          card.setDepth(1502);
          objects.push(card);
        }
        currY += gridHeight;
      }

      currY += stageBlockPaddingY;
    });

    const transition = this.scene.add
      .rectangle(0, 0, gameWidth, gameHeight, 0x000000)
      .setOrigin(0)
      .setAlpha(0)
      .setDepth(2000);

    const backBtnWidth = gameWidth * 0.06;
    const backBtnHeight = gameHeight * 0.06;

    const backBtn = this.scene.add
      .image(
        backBtnWidth / 2 + gameWidth * 0.015,
        backBtnHeight / 2 + gameHeight * 0.025,
        "BackMenu"
      )
      .setOrigin(0.5)
      .setDisplaySize(backBtnWidth, backBtnHeight)
      .setDepth(1503)
      .setInteractive({ useHandCursor: true });

    backBtn.on("pointerdown", () => {
      this.scene.tweens.add({
        targets: transition,
        alpha: 1,
        duration: 500,
        onComplete: () => {
          this.scene.scene.restart();
        },
      });
    });
  }

  renderPrizePanel(prizes: PrizeInfo[]) {
    this.collectedPrizeGraphics.forEach((c) => c.destroy());
    this.collectedPrizeGraphics = [];

    const gameWidth = this.scene.scale.width;
    const gameHeight = this.scene.scale.height;

    const columns = 4;
    const cardWidth = gameWidth * 0.11;
    const cardHeight = gameHeight * 0.058;
    const gap = gameWidth * 0.0075;
    const cardSpacingX = cardWidth + gap;
    const cardSpacingY = cardHeight + gap;

    const baseX = gameWidth * 0.574;
    const baseY = gameHeight * 0.32;

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
