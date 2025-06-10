import Phaser from "phaser";
import { PrizeModel } from "./model/lucky_draw_model";
import { LuckyDrawView } from "./view/lucky_draw_view";
import { LuckyDrawController } from "./controller/lucky_draw_controller";

export default class LuckyDrawScene extends Phaser.Scene {
  private model!: PrizeModel;
  private view!: LuckyDrawView;
  private controller!: LuckyDrawController;

  constructor() {
    super({ key: "LuckyDrawScene" });
  }

  preload() {
    this.model = new PrizeModel();
    this.view = new LuckyDrawView(this);
    this.view.preload();
    // this.load.audio("jungle_theme", "assets/audio/safari_theme_music.mp3");
  }

  create() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    // this.input.setDefaultCursor(
    //   "url('/assets/images/cursor_hand.png'), pointer"
    // );

    this.view.createLayout(centerX, centerY);
    this.controller = new LuckyDrawController(this.model, this.view, this);
  }
}
