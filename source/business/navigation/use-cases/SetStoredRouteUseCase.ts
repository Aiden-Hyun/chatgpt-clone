import { ILogger } from '../../../service/interfaces/core';
import { IStorageService, SetStoredRouteParams, SetStoredRouteResult } from '../../interfaces';

export class SetStoredRouteUseCase {
  constructor(
    private storageService: IStorageService,
    private logger: ILogger
  ) {}

  async execute(params: SetStoredRouteParams): Promise<SetStoredRouteResult> {
    try {
      this.logger.info('SetStoredRouteUseCase: Setting stored route', {
        key: params.key,
        hasRoute: !!params.route
      });

      // Validate input
      if (!params.key || params.key.trim() === '') {
        return {
          success: false,
          error: 'Storage key is required'
        };
      }

      if (!params.route || params.route.trim() === '') {
        return {
          success: false,
          error: 'Route is required'
        };
      }

      // Store route in storage service
      await this.storageService.setItem(params.key, params.route);

      this.logger.info('SetStoredRouteUseCase: Route stored successfully', {
        key: params.key,
        route: params.route
      });

      return {
        success: true
      };

    } catch (error) {
      this.logger.error('SetStoredRouteUseCase: Error setting stored route', {
        error,
        key: params.key,
        route: params.route
      });
      return {
        success: false,
        error: 'Failed to set stored route'
      };
    }
  }
}
