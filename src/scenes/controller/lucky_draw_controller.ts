import type { PrizeModel } from "../model/lucky_draw_model";
import type { LuckyDrawView } from "../view/lucky_draw_view";

export class LuckyDrawController {
  private model: PrizeModel;
  private view: LuckyDrawView;
  private scene: Phaser.Scene;

  constructor(model: PrizeModel, view: LuckyDrawView, scene: Phaser.Scene) {
    this.model = model;
    this.view = view;
    this.scene = scene;

    this.view.onStart = () => this.handleStart();
  }

  handleStart() {
    this.view.showGameScreen();

 
  }
}
