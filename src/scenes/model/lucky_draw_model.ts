export interface PrizeInfo {
  phone: any;
  name: any;
  ticket: number;
}

export class PrizeModel {
  private collected: PrizeInfo[] = [];
  private preloadedWinners: PrizeInfo[] = [];

  // ✅ Add prize during gameplay
  addPrize(prize: PrizeInfo) {
    this.collected.push(prize);
  }

  getPrizes(): PrizeInfo[] {
    return [...this.collected];
  }

  clearPrizes() {
    this.collected = [];
  }

  setPrizes(prizes: PrizeInfo[]) {
    this.collected = [...prizes];
  }

  // ✅ Set preloaded winners from fetch or file
  setPreloadedWinners(winners: PrizeInfo[]) {
    this.preloadedWinners = winners;
  }

  // ✅ Get preloaded winners
  getPreloadedWinners(): PrizeInfo[] {
    return this.preloadedWinners;
  }

  // ✅ Remove a winner by phone number to prevent reuse
  removePreloadedWinnerByPhone(phone: any) {
    this.preloadedWinners = this.preloadedWinners.filter(
      (p) => p.phone !== phone
    );
  }
}
