import { ILogger } from '../../../service/shared/interfaces/ILogger';
import { ClearStorageParams, ClearStorageResult, IStorageService } from '../../interfaces';

export class ClearStorageUseCase {
  constructor(
    private storageService: IStorageService,
    private logger: ILogger
  ) {}

  async execute(params: ClearStorageParams): Promise<ClearStorageResult> {
    try {
      this.logger.info('ClearStorageUseCase: Starting storage clear', {
        storageType: params.storageType
      });

      // Validate input
      if (!params.storageType) {
        return {
          success: false,
          error: 'Storage type is required'
        };
      }

      // Clear storage based on type
      const result = await this.storageService.clear(params.storageType);
      
      if (!result.success) {
        this.logger.warn('ClearStorageUseCase: Failed to clear storage', {
          storageType: params.storageType,
          error: result.error
        });
        return result;
      }

      this.logger.info('ClearStorageUseCase: Storage cleared successfully', {
        storageType: params.storageType,
        clearedKeys: result.clearedKeys?.length || 0
      });

      return {
        success: true,
        clearedKeys: result.clearedKeys
      };

    } catch (error) {
      this.logger.error('ClearStorageUseCase: Error clearing storage', {
        error,
        storageType: params.storageType
      });
      return {
        success: false,
        error: 'Failed to clear storage'
      };
    }
  }
}
