export type PrizeInfo = {
  name: string;
  phone: string;
  // Add more fields if needed (prize image, description, etc)
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
