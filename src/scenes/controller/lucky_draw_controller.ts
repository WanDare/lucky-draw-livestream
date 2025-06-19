import { API_BASE_URL } from "../utils/constants";
import type { PrizeModel, PrizeInfo } from "../model/lucky_draw_model";
import type { LuckyDrawView } from "../view/lucky_draw_view";
import { PopupComponent } from "../components/PopupComponent";

const GAME_STATE_VERSION = "v2";

export class LuckyDrawController {
  private model: PrizeModel;
  private view: LuckyDrawView;
  private scene: Phaser.Scene;
  private isCollectingPrize = false;

  private stages = [
    {
      count: 24,
      label: "Stage 1: ចាប់យកឲបាន 24 Ticket",
      winner: "អ្នកឈ្នះរង្វាន់",
    },
    {
      count: 12,
      label: "Stage 2: ចាប់យកឲបាន 12 Ticket",
      winner: "អ្នកឈ្នះរង្វាន់",
    },
    {
      count: 1,
      label: "Final Stage: ចាប់យកឲបាន 1 Ticket",
      winner: "អ្នកឈ្នះរង្វាន់",
    },
  ];

  stagePrizes = [
    { image: "Prize", name: "Gift Yellow Box", value: "24 ​​រង្វាន់" },
    { image: "Prize2", name: "Sakkin Aojiru Box", value: "12 ​រង្វាន់" },
    { image: "Prize3", name: "IPHONE 16 PRO MAX", value: "1 ​​រង្វាន់" },
  ];

  private currentStage = 0;
  private maxCollect = 0;
  private ballPairs: {
    ball: Phaser.GameObjects.Image;
    tween: Phaser.Tweens.Tween;
  }[] = [];
  private ballSpawnTimer?: Phaser.Time.TimerEvent;
  private stageWinners: PrizeInfo[][] = [];

  constructor(model: PrizeModel, view: LuckyDrawView, scene: Phaser.Scene) {
    this.model = model;
    this.view = view;
    this.scene = scene;

    this.view.onStart = () => this.onStartGame();
    this.view.onPopupClosed = () => {
      this.isCollectingPrize = false;
      this.resumeAllBalls();
    };
  }

  private hasSavedGame(): boolean {
    return !!localStorage.getItem("luckyDrawState");
  }

  private saveGameState() {
    const state = {
      version: GAME_STATE_VERSION,
      currentStage: this.currentStage,
      prizes: this.model.getPrizes(),
      stageWinners: this.stageWinners,
    };
    localStorage.setItem("luckyDrawState", JSON.stringify(state));
  }

  private loadGameState() {
    const raw = localStorage.getItem("luckyDrawState");
    if (!raw) return;
    try {
      const state = JSON.parse(raw);
      if (state.version !== GAME_STATE_VERSION) {
        this.clearGameState();
        return;
      }
      this.currentStage = state.currentStage ?? 0;
      this.stageWinners = state.stageWinners ?? [];
      this.model.setPrizes(state.prizes ?? []);
    } catch (e) {
      console.error("Failed to load saved state", e);
    }
  }

  private clearGameState() {
    localStorage.removeItem("luckyDrawState");
  }

  onStartGame() {
    if (this.hasSavedGame()) {
      PopupComponent.showConfirm(
        this.scene,
        "Do want to continue the previous game?",
        "Resume",
        "Restart",
        () => {
          this.loadGameState();
          this.view.reset();
          this.stageWinners.forEach((stage) =>
            this.view.showStageWinnersPanel(stage, () => {})
          );
          if (this.currentStage >= this.stages.length) {
            this.view.showGameCompleteSummary();
          } else {
            const stageCount = this.stages[this.currentStage].count;
            this.view.renderPrizePanel(this.model.getPrizes(), stageCount);
          }
          this.curtainStageTransition(() => this.startStage(this.currentStage));
        },
        () => {
          this.clearGameState();
          this.currentStage = 0;
          this.stageWinners = [];
          this.curtainStageTransition(() => this.startStage(0));
        }
      );
    } else {
      this.clearGameState();
      this.currentStage = 0;
      this.stageWinners = [];
      this.curtainStageTransition(() => this.startStage(0));
    }
  }

  startStage(stageIdx: number) {
    this.clearAllBalls();
    if (this.model.getPrizes().length === 0) {
      this.model.clearPrizes();
    }
    const stageCount = this.stages[this.currentStage].count;
    this.view.renderPrizePanel(this.model.getPrizes(), stageCount);
    this.maxCollect = this.stages[stageIdx].count;
    this.view.showStageLabel?.(stageIdx);
    this.view.showGameScreen(() => this.startInfiniteBallDrop());
    this.view.showStagePrize(this.stagePrizes[stageIdx]);
  }

  async fetchRandomPrizeInfo(): Promise<PrizeInfo> {
    const res = await fetch(
      `${API_BASE_URL}/c65aae6b-031e-427b-8fe7-64256ceee37c`
    );
    if (!res.ok) throw new Error("Failed to fetch prize info");
    const data = await res.json();
    return Array.isArray(data)
      ? data[Math.floor(Math.random() * data.length)]
      : data;
  }

  startInfiniteBallDrop() {
    if (this.ballSpawnTimer) this.ballSpawnTimer.remove(false);
    this.ballSpawnTimer = this.scene.time.addEvent({
      delay: 300,
      loop: true,
      callback: () => {
        if (this.model.getPrizes().length >= this.maxCollect) {
          this.ballSpawnTimer?.remove(false);
          return;
        }
        this.spawnBall();
      },
    });
  }

  spawnBall() {
    const { width, height } = this.scene.scale;
    const x = Phaser.Math.Between(width * 0.015, width * 0.47);
    const y = height * 0.16;
    const ballSize = Math.max(width, height) * 0.07;

    const ball = this.scene.add
      .image(x, y, "Ball")
      .setOrigin(0.5)
      .setDisplaySize(ballSize, ballSize)
      .setDepth(2)
      .setInteractive({ useHandCursor: true });

    ball.setAngle(Phaser.Math.Between(-45, 45));

    const tween = this.scene.tweens.add({
      targets: ball,
      y: height * 0.98,
      angle: Phaser.Math.Between(-270, 270),
      ease: "Sine.easeInOut",
      duration: Phaser.Math.Between(8500, 15000),
      delay: Phaser.Math.Between(0, 700),
      onComplete: () => {
        this.ballPairs = this.ballPairs.filter((p) => p.ball !== ball);
        if (ball.active) ball.destroy();
      },
    });

    this.ballPairs.push({ ball, tween });

    ball.on("pointerdown", async () => {
      if (
        this.isCollectingPrize ||
        this.model.getPrizes().length >= this.maxCollect
      )
        return;
      this.isCollectingPrize = true;
      ball.disableInteractive();
      try {
        const prize = await this.fetchRandomPrizeInfo();
        this.collectPrizeWithAnimation(ball, prize);
      } catch (e) {
        ball.setInteractive({ useHandCursor: true });
        this.isCollectingPrize = false;
        console.error("Prize fetch failed", e);
      }
    });
  }

  collectPrizeWithAnimation(ball: Phaser.GameObjects.Image, prize: PrizeInfo) {
    const { width, height } = this.scene.scale;
    this.pauseAllBalls();
    this.view.showPrizeCongratulation(prize);

    const idx = this.model.getPrizes().length;
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const cardW = width * 0.14;
    const cardH = height * 0.063;
    const gap = width * 0.007;
    const destX = width * 0.6 + col * (cardW + gap);
    const destY = height * 0.32 + row * (cardH + gap);

    const flyBall = this.scene.add
      .image(ball.x, ball.y, "Ball")
      .setOrigin(0.5)
      .setDisplaySize(cardH, cardH)
      .setDepth(100);

    this.scene.tweens.add({
      targets: flyBall,
      x: destX,
      y: destY,
      scale: 1.3,
      alpha: 0.6,
      duration: 700,
      ease: "Cubic.easeIn",
      onComplete: () => {
        flyBall.destroy();
        this.model.addPrize(prize);
        const stageCount = this.stages[this.currentStage].count;
        this.view.renderPrizePanel(this.model.getPrizes(), stageCount);
        this.saveGameState();
        if (this.model.getPrizes().length >= this.maxCollect) {
          this.onStageComplete();
        }
      },
    });

    this.scene.tweens.add({
      targets: ball,
      scale: 1.4,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        ball.destroy();
        this.ballPairs = this.ballPairs.filter((p) => p.ball !== ball);
      },
    });
  }

  pauseAllBalls() {
    this.ballPairs.forEach((p) => {
      if (p.ball.active && p.tween && !p.tween.paused) {
        p.tween.pause();
        p.ball.disableInteractive();
      }
    });
    if (this.ballSpawnTimer) this.ballSpawnTimer.paused = true;
  }

  resumeAllBalls() {
    this.ballPairs.forEach((p) => {
      if (p.ball.active && p.tween && p.tween.paused) {
        p.tween.resume();
        p.ball.setInteractive({ useHandCursor: true });
      }
    });
    if (this.ballSpawnTimer) this.ballSpawnTimer.paused = false;
  }

  onStageComplete() {
    this.clearAllBalls();
    const prizes = this.model.getPrizes();
    this.view.collectedPrizeGraphics.forEach((c) => c.destroy());
    this.view.collectedPrizeGraphics = [];

    this.view.slideOutPeople(() => {
      this.view.showStageWinnersPanel(prizes, () => {
        this.stageWinners.push([...prizes]);
        this.currentStage++;
        if (this.currentStage < this.stages.length) {
          this.model.clearPrizes();
          this.saveGameState();
          this.curtainStageTransition(() => this.startStage(this.currentStage));
        } else {
          this.clearGameState();
          this.curtainStageTransition(() => {
            this.view.showGameComplete?.();
          });
        }
      });
    });
  }

  clearAllBalls() {
    this.ballPairs.forEach((p) => {
      if (p.tween?.isPlaying()) p.tween.stop();
      if (p.ball?.active) p.ball.destroy();
    });
    this.ballPairs = [];
    if (this.ballSpawnTimer) {
      this.ballSpawnTimer.remove(false);
      this.ballSpawnTimer = undefined;
    }
  }

  private curtainStageTransition(action: () => void) {
    this.view.closeCurtain(() => {
      action();
      this.view.openCurtain();
    });
  }
}
