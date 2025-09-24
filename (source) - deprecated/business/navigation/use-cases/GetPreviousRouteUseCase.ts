import { INavigationTracker } from '../../interfaces/navigation';

/**
 * Use case for getting and managing previous route
 */
export class GetPreviousRouteUseCase {
  constructor(
    private navigationTracker: INavigationTracker
  ) {}

  execute() {
    return {
      previousRoute: this.navigationTracker.getPreviousRoute(),
      clearRoute: () => this.navigationTracker.clearPreviousRoute()
    };
  }
}
