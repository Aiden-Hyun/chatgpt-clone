// Business Layer Provider - Creates and configures business layer dependencies
// Follows layered architecture: Business layer owns its dependency configuration

import { IAlertService, IToastService } from '../alert/interfaces';
import { IUserRepository } from '../auth/interfaces/IUserRepository';
import { IAIProvider } from '../chat/interfaces/IAIProvider';
import { IChatRoomRepository } from '../chat/interfaces/IChatRoomRepository';
import { IClipboardAdapter } from '../chat/interfaces/IClipboardAdapter';
import { IMessageRepository } from '../chat/interfaces/IMessageRepository';
import { ILanguageService } from '../language/interfaces/ILanguageService';
import { INavigationService, INavigationTracker } from '../navigation/interfaces';
import { ISessionRepository } from '../session/interfaces/ISessionRepository';
import { ISecureStorageService, IStorageService } from '../storage/interfaces';

// Import config service
import { ConfigService } from '../../service/shared/lib/config';

// Import concrete implementations from persistence layer
import { UserRepository } from '../../persistence/auth/repositories/UserRepository';
import { AIProvider } from '../../persistence/chat/adapters/AIProvider';
import { ClipboardAdapter } from '../../persistence/chat/adapters/ClipboardAdapter';
import { ChatRoomRepository } from '../../persistence/chat/repositories/ChatRoomRepository';
import { MessageRepository } from '../../persistence/chat/repositories/MessageRepository';
import { LanguageRepository } from '../../persistence/language/repositories/LanguageRepository';
import { SessionRepository } from '../../persistence/session/repositories/SessionRepository';

// Import service layer utilities  
import { AlertService, ToastService } from '../../service/alert';
import { IdGenerator } from '../../service/chat/generators/IdGenerator';
import { IIdGenerator } from '../../service/chat/interfaces/IIdGenerator';
import { IMessageValidator } from '../../service/chat/interfaces/IMessageValidator';
import { MessageValidator } from '../../service/chat/validators/MessageValidator';
import { AsyncStorageAdapter } from '../../service/language/adapters/AsyncStorageAdapter';
import { LanguageService } from '../../service/language/LanguageService';
import { NavigationService, NavigationTracker } from '../../service/navigation';
import { ILogger } from '../../service/shared/interfaces/ILogger';
import { Logger } from '../../service/shared/utils/Logger';
import { MobileStorageService, SecureStorageService } from '../../service/storage';

import { UseCaseFactory } from './UseCaseFactory';

/**
 * Business Layer Provider - Configures dependency injection for business layer
 * This replaces the singleton antipattern with proper dependency injection
 */
export class BusinessLayerProvider {
  private useCaseFactory: UseCaseFactory;
  
  // Repository instances
  private userRepository: IUserRepository;
  private sessionRepository: ISessionRepository;
  private messageRepository: IMessageRepository;
  private chatRoomRepository: IChatRoomRepository;
  private languageRepository: LanguageRepository;
  
  // Adapter instances  
  private aiProvider: IAIProvider;
  private clipboardAdapter: IClipboardAdapter;
  private storageAdapter: AsyncStorageAdapter;
  
  // Service instances
  private logger: ILogger;
  private messageValidator: IMessageValidator;
  private idGenerator: IIdGenerator;
  private languageService: ILanguageService;
  private configService: ConfigService;
  private toastService: IToastService;
  private alertService: IAlertService;
  private navigationTracker: INavigationTracker;
  private navigationService: INavigationService;
  private storageService: IStorageService;
  private secureStorageService: ISecureStorageService;

  constructor() {
    // Initialize dependencies once
    this.initializeDependencies();
    
    // Create factory with injected dependencies
    this.useCaseFactory = new UseCaseFactory(
      this.userRepository,
      this.sessionRepository,
      this.messageRepository,
      this.chatRoomRepository,
      this.aiProvider,
      this.clipboardAdapter,
      this.logger,
      this.messageValidator,
      this.idGenerator
    );
  }

  private initializeDependencies(): void {
    // Initialize service layer dependencies first (no dependencies)
    this.logger = new Logger();
    this.messageValidator = new MessageValidator();
    this.idGenerator = new IdGenerator();
    
    // Create config service
    this.configService = new ConfigService(this.logger);
    
    // Initialize storage adapter
    this.storageAdapter = new AsyncStorageAdapter(this.logger);
    
    // Initialize storage services
    this.storageService = new MobileStorageService(this.logger);
    this.secureStorageService = new SecureStorageService(this.logger);
    
    // Initialize persistence layer dependencies (depend on service layer)
    this.userRepository = new UserRepository();
    this.sessionRepository = new SessionRepository();
    this.messageRepository = new MessageRepository();
    this.chatRoomRepository = new ChatRoomRepository();
    this.aiProvider = new AIProvider(this.configService, this.logger);
    this.clipboardAdapter = new ClipboardAdapter();
    
    // Initialize language repository and service
    this.languageRepository = new LanguageRepository(this.storageAdapter, this.logger);
    this.languageService = new LanguageService(this.languageRepository, this.logger);
    
    // Initialize alert services
    this.toastService = new ToastService(this.logger, this.idGenerator);
    this.alertService = new AlertService(this.logger, this.idGenerator);
    
    // Initialize navigation services
    this.navigationTracker = new NavigationTracker(this.logger);
    this.navigationService = new NavigationService(this.navigationTracker, this.logger);
  }

  // Factory getter
  getUseCaseFactory(): UseCaseFactory {
    return this.useCaseFactory;
  }

  // Direct repository access for advanced scenarios
  getUserRepository(): IUserRepository {
    return this.userRepository;
  }

  getSessionRepository(): ISessionRepository {
    return this.sessionRepository;
  }

  getMessageRepository(): IMessageRepository {
    return this.messageRepository;
  }

  getChatRoomRepository(): IChatRoomRepository {
    return this.chatRoomRepository;
  }

  getAIProvider(): IAIProvider {
    return this.aiProvider;
  }

  getClipboardAdapter(): IClipboardAdapter {
    return this.clipboardAdapter;
  }
  
  getLanguageService(): ILanguageService {
    return this.languageService;
  }
  
  getToastService(): IToastService {
    return this.toastService;
  }
  
  getAlertService(): IAlertService {
    return this.alertService;
  }
  
  getNavigationTracker(): INavigationTracker {
    return this.navigationTracker;
  }
  
  getNavigationService(): INavigationService {
    return this.navigationService;
  }
  
  getStorageService(): IStorageService {
    return this.storageService;
  }
  
  getSecureStorageService(): ISecureStorageService {
    return this.secureStorageService;
  }

  // Service getters
  getLogger(): ILogger {
    return this.logger;
  }

  getMessageValidator(): IMessageValidator {
    return this.messageValidator;
  }

  getIdGenerator(): IIdGenerator {
    return this.idGenerator;
  }
  
  getConfigService(): ConfigService {
    return this.configService;
  }
}