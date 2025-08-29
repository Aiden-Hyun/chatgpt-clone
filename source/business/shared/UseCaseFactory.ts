// Use Case Factory - Creates configured use cases with proper DI
// Follows layered architecture: Business layer factory for business objects

import {
    IAIProvider,
    IAuthEventEmitter,
    IChatRoomRepository,
    IClipboardAdapter,
    IMessageRepository,
    ISessionRepository,
    IUserRepository
} from '../interfaces';

// Service layer interfaces
import { IIdGenerator } from '../../service/chat/interfaces/IIdGenerator';
import { IMessageValidator } from '../../service/chat/interfaces/IMessageValidator';
import { ILogger } from '../../service/shared/interfaces/ILogger';

// Use Cases
import { CheckAuthorizationUseCase } from '../auth/use-cases/CheckAuthorizationUseCase';
import { MonitorAuthStateUseCase } from '../auth/use-cases/MonitorAuthStateUseCase';
import { RefreshTokenUseCase } from '../auth/use-cases/RefreshTokenUseCase';
import { RequestPasswordResetUseCase } from '../auth/use-cases/RequestPasswordResetUseCase';
import { ResetPasswordUseCase } from '../auth/use-cases/ResetPasswordUseCase';
import { SignInUseCase } from '../auth/use-cases/SignInUseCase';
import { SignOutUseCase } from '../auth/use-cases/SignOutUseCase';
import { SignUpUseCase } from '../auth/use-cases/SignUpUseCase';
import { SocialAuthUseCase } from '../auth/use-cases/SocialAuthUseCase';
import { CopyMessageUseCase } from '../chat/use-cases/CopyMessageUseCase';
import { CreateRoomUseCase } from '../chat/use-cases/CreateRoomUseCase';
import { DeleteMessageUseCase } from '../chat/use-cases/DeleteMessageUseCase';
import { DeleteRoomUseCase } from '../chat/use-cases/DeleteRoomUseCase';
import { EditMessageUseCase } from '../chat/use-cases/EditMessageUseCase';
import { ListRoomsUseCase } from '../chat/use-cases/ListRoomsUseCase';
import { ReceiveMessageUseCase } from '../chat/use-cases/ReceiveMessageUseCase';
import { RegenerateAssistantUseCase } from '../chat/use-cases/RegenerateAssistantUseCase';
import { ResendMessageUseCase } from '../chat/use-cases/ResendMessageUseCase';
import { SendMessageUseCase } from '../chat/use-cases/SendMessageUseCase';
import { UpdateRoomUseCase } from '../chat/use-cases/UpdateRoomUseCase';
import { AutoLogoutUseCase } from '../session/use-cases/AutoLogoutUseCase';
import { GetSessionUseCase } from '../session/use-cases/GetSessionUseCase';
import { RefreshSessionUseCase } from '../session/use-cases/RefreshSessionUseCase';
import { UpdateSessionActivityUseCase } from '../session/use-cases/UpdateSessionActivityUseCase';
import { ValidateSessionUseCase } from '../session/use-cases/ValidateSessionUseCase';

/**
 * Factory for creating use cases with injected dependencies
 * This replaces the Service Locator antipattern with proper dependency injection
 */
export class UseCaseFactory {
  constructor(
    // Repository dependencies (injected)
    private userRepository: IUserRepository,
    private sessionRepository: ISessionRepository,
    private messageRepository: IMessageRepository,
    private chatRoomRepository: IChatRoomRepository,
    
    // Adapter dependencies (injected)
    private aiProvider: IAIProvider,
    private clipboardAdapter: IClipboardAdapter,
    private authEventEmitter: IAuthEventEmitter,
    
    // Service dependencies (injected)
    private logger: ILogger,
    private messageValidator: IMessageValidator,
    private idGenerator: IIdGenerator
  ) {}

  // Auth Use Cases
  createSignInUseCase(): SignInUseCase {
    return new SignInUseCase(
      this.userRepository,
      this.sessionRepository
    );
  }

  createSignUpUseCase(): SignUpUseCase {
    return new SignUpUseCase(
      this.userRepository
    );
  }

  createSignOutUseCase(): SignOutUseCase {
    return new SignOutUseCase(
      this.sessionRepository,
      this.userRepository
    );
  }

  createRefreshTokenUseCase(): RefreshTokenUseCase {
    return new RefreshTokenUseCase(
      this.userRepository,
      this.sessionRepository
    );
  }

  createMonitorAuthStateUseCase(): MonitorAuthStateUseCase {
    return new MonitorAuthStateUseCase(
      this.authEventEmitter,
      this.sessionRepository
    );
  }

  // Chat Use Cases
  createSendMessageUseCase(): SendMessageUseCase {
    return new SendMessageUseCase(
      this.messageRepository,
      this.chatRoomRepository,
      this.aiProvider,
      this.messageValidator,
      this.idGenerator,
      this.logger
    );
  }

  createReceiveMessageUseCase(): ReceiveMessageUseCase {
    return new ReceiveMessageUseCase(
      this.messageRepository,
      this.aiProvider,
      this.idGenerator,
      this.logger
    );
  }

  createDeleteMessageUseCase(): DeleteMessageUseCase {
    return new DeleteMessageUseCase(
      this.messageRepository,
      this.logger
    );
  }

  createCopyMessageUseCase(): CopyMessageUseCase {
    return new CopyMessageUseCase(
      this.messageRepository,
      this.clipboardAdapter,
      this.logger
    );
  }

  createEditMessageUseCase(): EditMessageUseCase {
    return new EditMessageUseCase(
      this.messageRepository,
      this.chatRoomRepository,
      this.messageValidator,
      this.logger
    );
  }

  createResendMessageUseCase(): ResendMessageUseCase {
    return new ResendMessageUseCase(
      this.messageRepository,
      this.chatRoomRepository,
      this.aiProvider,
      this.idGenerator,
      this.logger
    );
  }

  createRegenerateAssistantUseCase(): RegenerateAssistantUseCase {
    return new RegenerateAssistantUseCase(
      this.messageRepository,
      this.chatRoomRepository,
      this.aiProvider,
      this.idGenerator,
      this.logger
    );
  }

  // Room Use Cases
  createCreateRoomUseCase(): CreateRoomUseCase {
    return new CreateRoomUseCase(
      this.chatRoomRepository
    );
  }

  createUpdateRoomUseCase(): UpdateRoomUseCase {
    return new UpdateRoomUseCase(
      this.chatRoomRepository,
      this.logger
    );
  }

  createDeleteRoomUseCase(): DeleteRoomUseCase {
    return new DeleteRoomUseCase(
      this.chatRoomRepository,
      this.logger
    );
  }

  createListRoomsUseCase(): ListRoomsUseCase {
    return new ListRoomsUseCase(
      this.chatRoomRepository,
      this.logger
    );
  }

  // Session Use Cases
  createGetSessionUseCase(): GetSessionUseCase {
    return new GetSessionUseCase(
      this.sessionRepository,
      this.userRepository
    );
  }

  createRefreshSessionUseCase(): RefreshSessionUseCase {
    return new RefreshSessionUseCase(
      this.sessionRepository,
      this.userRepository
    );
  }

  createValidateSessionUseCase(): ValidateSessionUseCase {
    return new ValidateSessionUseCase(
      this.sessionRepository,
      this.createRefreshTokenUseCase()
    );
  }

  createUpdateSessionActivityUseCase(): UpdateSessionActivityUseCase {
    return new UpdateSessionActivityUseCase(
      this.sessionRepository
    );
  }

  createAutoLogoutUseCase(): AutoLogoutUseCase {
    return new AutoLogoutUseCase(
      this.sessionRepository,
      this.createSignOutUseCase()
    );
  }

  createRequestPasswordResetUseCase(): RequestPasswordResetUseCase {
    return new RequestPasswordResetUseCase(
      this.userRepository
    );
  }

  createResetPasswordUseCase(): ResetPasswordUseCase {
    return new ResetPasswordUseCase(
      this.userRepository
    );
  }

  createSocialAuthUseCase(): SocialAuthUseCase {
    return new SocialAuthUseCase(
      this.userRepository,
      this.sessionRepository
    );
  }

  createCheckAuthorizationUseCase(): CheckAuthorizationUseCase {
    return new CheckAuthorizationUseCase(
      this.sessionRepository
    );
  }

  // Getter methods for repositories (needed by view models)
  getMessageRepository(): IMessageRepository {
    return this.messageRepository;
  }

  getChatRoomRepository(): IChatRoomRepository {
    return this.chatRoomRepository;
  }
}
