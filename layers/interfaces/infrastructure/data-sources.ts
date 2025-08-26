// Data source interfaces for external data
export interface DatabaseClient {
  query<T>(sql: string, params?: any[]): Promise<T[]>;
  queryOne<T>(sql: string, params?: any[]): Promise<T | null>;
  execute(sql: string, params?: any[]): Promise<void>;
  transaction<T>(callback: (client: DatabaseClient) => Promise<T>): Promise<T>;
  beginTransaction(): Promise<Transaction>;
  close(): Promise<void>;
  isConnected(): boolean;
}

export interface Transaction {
  commit(): Promise<void>;
  rollback(): Promise<void>;
  query<T>(sql: string, params?: any[]): Promise<T[]>;
  queryOne<T>(sql: string, params?: any[]): Promise<T | null>;
  execute(sql: string, params?: any[]): Promise<void>;
}

export interface CacheClient {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  exists(key: string): Promise<boolean>;
  getKeys(pattern?: string): Promise<string[]>;
  getTtl(key: string): Promise<number | null>;
  setTtl(key: string, ttl: number): Promise<void>;
  increment(key: string, value?: number): Promise<number>;
  decrement(key: string, value?: number): Promise<number>;
}

export interface FileStorageClient {
  upload(path: string, data: Buffer, options?: UploadOptions): Promise<string>;
  download(path: string): Promise<Buffer>;
  delete(path: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  getUrl(path: string): Promise<string>;
  listFiles(prefix?: string): Promise<FileInfo[]>;
  getFileInfo(path: string): Promise<FileInfo | null>;
}

export interface MessageQueueClient {
  publish(topic: string, message: any, options?: PublishOptions): Promise<void>;
  subscribe(topic: string, handler: MessageHandler): Promise<Subscription>;
  unsubscribe(subscription: Subscription): Promise<void>;
  close(): Promise<void>;
}

export interface EventBusClient {
  emit(event: string, data: any): Promise<void>;
  on(event: string, handler: EventHandler): Promise<void>;
  off(event: string, handler: EventHandler): Promise<void>;
  once(event: string, handler: EventHandler): Promise<void>;
  removeAllListeners(event?: string): Promise<void>;
}

export interface SearchIndexClient {
  index(document: SearchDocument): Promise<void>;
  search(query: string, options?: SearchIndexOptions): Promise<SearchIndexResult[]>;
  delete(id: string): Promise<void>;
  update(id: string, document: Partial<SearchDocument>): Promise<void>;
  clear(): Promise<void>;
  getStats(): Promise<SearchIndexStats>;
}

// Supporting types
export interface UploadOptions {
  contentType?: string;
  metadata?: Record<string, string>;
  public?: boolean;
  encryption?: EncryptionOptions;
}

export interface EncryptionOptions {
  algorithm: string;
  key: string;
  iv?: string;
}

export interface FileInfo {
  path: string;
  size: number;
  contentType: string;
  lastModified: Date;
  metadata?: Record<string, string>;
}

export interface PublishOptions {
  priority?: number;
  delay?: number;
  retryCount?: number;
  headers?: Record<string, string>;
}

export interface MessageHandler {
  (message: any, metadata: MessageMetadata): Promise<void>;
}

export interface MessageMetadata {
  id: string;
  topic: string;
  timestamp: Date;
  attempts: number;
  headers?: Record<string, string>;
}

export interface Subscription {
  id: string;
  topic: string;
  unsubscribe(): Promise<void>;
}

export interface EventHandler {
  (data: any, metadata: EventMetadata): void;
}

export interface EventMetadata {
  event: string;
  timestamp: Date;
  source: string;
  correlationId?: string;
}

export interface SearchDocument {
  id: string;
  type: string;
  content: string;
  metadata?: Record<string, any>;
  tags?: string[];
  timestamp: Date;
}

export interface SearchIndexOptions {
  limit?: number;
  offset?: number;
  filters?: Record<string, any>;
  sort?: SortOption[];
  highlight?: boolean;
  facets?: string[];
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

export interface SearchIndexResult {
  id: string;
  score: number;
  document: SearchDocument;
  highlights?: Record<string, string[]>;
  facets?: Record<string, FacetValue[]>;
}

export interface FacetValue {
  value: string;
  count: number;
}

export interface SearchIndexStats {
  documentCount: number;
  indexSize: number;
  lastUpdated: Date;
  health: 'healthy' | 'degraded' | 'unhealthy';
}
