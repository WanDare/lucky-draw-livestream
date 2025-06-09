export type PrizeInfo = {
  name: string;
  phone: string;
};

export class PrizeModel {
  private collected: PrizeInfo[] = [];

  addPrize(prize: PrizeInfo) {
    this.collected.push(prize);
  }

  getPrizes(): PrizeInfo[] {
    return [...this.collected];
  }

  clearPrizes() {
    this.collected = [];
  }
}
