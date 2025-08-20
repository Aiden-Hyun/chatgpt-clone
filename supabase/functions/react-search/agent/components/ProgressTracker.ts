export class ProgressTracker {
  private previousFacetCoverage = 0;
  private iterationsWithoutProgress = 0;

  reset(): void {
    console.log(`🔄 [ProgressTracker] Resetting progress tracking`);
    this.previousFacetCoverage = 0;
    this.iterationsWithoutProgress = 0;
  }

  update(currentCoverage: number): { progressed: boolean; stop: boolean; iterationsWithoutProgress: number } {
    if (currentCoverage <= this.previousFacetCoverage) {
      this.iterationsWithoutProgress++;
      const stop = this.iterationsWithoutProgress >= 3;
      console.log(`📉 [ProgressTracker] No progress: ${this.iterationsWithoutProgress}/3 iterations without improvement`);
      return { progressed: false, stop, iterationsWithoutProgress: this.iterationsWithoutProgress };
    }
    this.previousFacetCoverage = currentCoverage;
    this.iterationsWithoutProgress = 0;
    console.log(`📈 [ProgressTracker] Progress detected: coverage increased to ${currentCoverage}`);
    return { progressed: true, stop: false, iterationsWithoutProgress: 0 };
  }
}


