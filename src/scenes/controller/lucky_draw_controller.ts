import type { PrizeModel } from "../model/lucky_draw_model";
import type { LuckyDrawView } from "../view/lucky_draw_view";

export class LuckyDrawController {
  private model: PrizeModel;
  private view: LuckyDrawView;
  private scene: Phaser.Scene;
  private spinning = false;
  private currentNumber = 0;
  private isSoundOn = true;
  private bgm?: Phaser.Sound.BaseSound;

  constructor(model: PrizeModel, view: LuckyDrawView, scene: Phaser.Scene) {
    this.model = model;
    this.view = view;
    this.scene = scene;
  }

  setupEvents(
    decreaseBtn: Phaser.GameObjects.Image,
    increaseBtn: Phaser.GameObjects.Image
  ) {
    decreaseBtn.on("pointerdown", () => {
      if (this.currentNumber > 0) {
        this.currentNumber--;
        this.view.numberText.setText(
          this.currentNumber.toString().padStart(2, "0")
        );
      }
    });

    increaseBtn.on("pointerdown", () => {
      this.currentNumber++;
      this.view.numberText.setText(
        this.currentNumber.toString().padStart(2, "0")
      );
    });


    this.setupExtraPanelEvents();
  }

  setupExtraPanelEvents() {
    // --- Refresh ---
    const refreshBtn = this.view.leftPanel[0];
    refreshBtn.setInteractive();
    refreshBtn.on("pointerdown", () => {
      window.location.reload();
    });

    // --- Reset ---
    const resetBtn = this.view.leftPanel[1];
    resetBtn.setInteractive();
    resetBtn.on("pointerdown", () => {
      this.currentNumber = 0;
      this.view.numberText.setText(
        this.currentNumber.toString().padStart(2, "0")
      );
    });

    // --- Sound Off/On ---
    const soundBtn = this.view.leftPanel[2];
    soundBtn.setInteractive();
    soundBtn.setTexture(this.isSoundOn ? "Soundon" : "Soundoff");
    soundBtn.setAlpha(1);
    soundBtn.on("pointerdown", () => {
      this.scene.tweens.add({
        targets: soundBtn,
        alpha: 0,
        duration: 120,
        ease: "Quad.easeIn",
        onComplete: () => {
          this.isSoundOn = !this.isSoundOn;
          soundBtn.setTexture(this.isSoundOn ? "Soundon" : "Soundoff");
          if (this.isSoundOn) {
            this.playBackgroundMusic();
          } else {
            this.stopBackgroundMusic();
          }
          this.scene.tweens.add({
            targets: soundBtn,
            alpha: 1,
            duration: 120,
            ease: "Quad.easeOut",
          });
        },
      });
    });
    soundBtn.setAlpha(0);
    this.scene.tweens.add({
      targets: soundBtn,
      alpha: 1,
      duration: 200,
      ease: "Quad.easeOut",
      onComplete: () => {
        if (this.isSoundOn) {
          this.playBackgroundMusic();
        }
      },
    });

    // --- Fullscreen ---
    const fullscreenBtn = this.view.leftPanel[3];
    fullscreenBtn.setInteractive();
    fullscreenBtn.on("pointerdown", () => {
      if (!this.scene.scale.isFullscreen) {
        this.scene.scale.startFullscreen();
      } else {
        this.scene.scale.stopFullscreen();
      }
    });
  }

  playBackgroundMusic() {
    if (!this.bgm) {
      this.bgm = this.scene.sound.add("jungle_theme", {
        loop: true,
        volume: 1,
      });
    }
    if (!this.bgm.isPlaying) {
      this.bgm.play();
    } else {
      this.bgm.resume();
    }
    this.scene.sound.mute = false;
  }

  stopBackgroundMusic() {
    if (this.bgm && this.bgm.isPlaying) {
      this.bgm.pause();
    }
    this.scene.sound.mute = true;
  }
}
