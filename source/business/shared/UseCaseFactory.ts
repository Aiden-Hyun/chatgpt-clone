// Use Case Factory - Creates configured use cases with proper DI
// Follows layered architecture: Business layer factory for business objects

import { IUserRepository } from '../auth/interfaces/IUserRepository';
import { ISessionRepository } from '../session/interfaces/ISessionRepository';
import { IMessageRepository } from '../chat/interfaces/IMessageRepository';
import { IChatRoomRepository } from '../chat/interfaces/IChatRoomRepository';
import { IAIProvider } from '../chat/interfaces/IAIProvider';
import { IClipboardAdapter } from '../chat/interfaces/IClipboardAdapter';

// Service layer interfaces
import { ILogger } from '../../service/shared/interfaces/ILogger';
import { IMessageValidator } from '../../service/chat/interfaces/IMessageValidator';
import { IIdGenerator } from '../../service/chat/interfaces/IIdGenerator';

// Use Cases
import { SignInUseCase } from '../auth/use-cases/SignInUseCase';
import { SignUpUseCase } from '../auth/use-cases/SignUpUseCase';
import { SignOutUseCase } from '../auth/use-cases/SignOutUseCase';
import { SendMessageUseCase } from '../chat/use-cases/SendMessageUseCase';
import { ReceiveMessageUseCase } from '../chat/use-cases/ReceiveMessageUseCase';
import { DeleteMessageUseCase } from '../chat/use-cases/DeleteMessageUseCase';
import { CopyMessageUseCase } from '../chat/use-cases/CopyMessageUseCase';
import { EditMessageUseCase } from '../chat/use-cases/EditMessageUseCase';
import { ResendMessageUseCase } from '../chat/use-cases/ResendMessageUseCase';
import { RegenerateAssistantUseCase } from '../chat/use-cases/RegenerateAssistantUseCase';
import { CreateRoomUseCase } from '../chat/use-cases/CreateRoomUseCase';
import { UpdateRoomUseCase } from '../chat/use-cases/UpdateRoomUseCase';
import { DeleteRoomUseCase } from '../chat/use-cases/DeleteRoomUseCase';
import { ListRoomsUseCase } from '../chat/use-cases/ListRoomsUseCase';
import { GetSessionUseCase } from '../session/use-cases/GetSessionUseCase';
import { RefreshSessionUseCase } from '../session/use-cases/RefreshSessionUseCase';
import { ValidateSessionUseCase } from '../session/use-cases/ValidateSessionUseCase';
import { UpdateSessionActivityUseCase } from '../session/use-cases/UpdateSessionActivityUseCase';

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
      this.chatRoomRepository,
      this.logger
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
      this.sessionRepository
    );
  }

  createUpdateSessionActivityUseCase(): UpdateSessionActivityUseCase {
    return new UpdateSessionActivityUseCase(
      this.sessionRepository
    );
  }
}
