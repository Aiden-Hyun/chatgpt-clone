// Storage interfaces
export interface LocalStorage {
  getItem<T>(key: string): Promise<T | null>;
  setItem<T>(key: string, value: T): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  getAllKeys(): Promise<string[]>;
  multiGet(keys: string[]): Promise<Array<[string, any]>>;
  multiSet(keyValuePairs: Array<[string, any]>): Promise<void>;
  multiRemove(keys: string[]): Promise<void>;
  exists(key: string): Promise<boolean>;
}

export interface SecureStorage {
  getItem<T>(key: string): Promise<T | null>;
  setItem<T>(key: string, value: T): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  getAllKeys(): Promise<string[]>;
  exists(key: string): Promise<boolean>;
}

export interface CloudStorage {
  upload(path: string, data: Buffer, options?: CloudStorageOptions): Promise<string>;
  download(path: string): Promise<Buffer>;
  delete(path: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  getUrl(path: string, options?: CloudStorageUrlOptions): Promise<string>;
  listFiles(prefix?: string, options?: CloudStorageListOptions): Promise<CloudStorageFile[]>;
  getFileInfo(path: string): Promise<CloudStorageFile | null>;
  copy(sourcePath: string, destinationPath: string): Promise<void>;
  move(sourcePath: string, destinationPath: string): Promise<void>;
}

export interface DatabaseStorage {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  
  // Query operations
  query<T>(sql: string, params?: any[]): Promise<T[]>;
  queryOne<T>(sql: string, params?: any[]): Promise<T | null>;
  execute(sql: string, params?: any[]): Promise<void>;
  
  // Transaction operations
  beginTransaction(): Promise<DatabaseTransaction>;
  transaction<T>(callback: (transaction: DatabaseTransaction) => Promise<T>): Promise<T>;
  
  // Migration operations
  migrate(migrations: DatabaseMigration[]): Promise<void>;
  getMigrationHistory(): Promise<DatabaseMigration[]>;
  rollback(steps: number): Promise<void>;
}

export interface CacheStorage {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  exists(key: string): Promise<boolean>;
  getKeys(pattern?: string): Promise<string[]>;
  getTtl(key: string): Promise<number | null>;
  setTtl(key: string, ttl: number): Promise<void>;
  
  // Advanced operations
  increment(key: string, value?: number): Promise<number>;
  decrement(key: string, value?: number): Promise<number>;
  getMultiple<T>(keys: string[]): Promise<Array<[string, T | null]>>;
  setMultiple<T>(keyValuePairs: Array<[string, T]>, ttl?: number): Promise<void>;
  deleteMultiple(keys: string[]): Promise<void>;
  
  // Pub/Sub operations
  publish(channel: string, message: any): Promise<number>;
  subscribe(channel: string, callback: (message: any) => void): Promise<void>;
  unsubscribe(channel: string): Promise<void>;
}

export interface FileSystemStorage {
  readFile(path: string, encoding?: string): Promise<string>;
  readFileBuffer(path: string): Promise<Buffer>;
  writeFile(path: string, data: string | Buffer): Promise<void>;
  appendFile(path: string, data: string | Buffer): Promise<void>;
  deleteFile(path: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  
  // Directory operations
  createDirectory(path: string, recursive?: boolean): Promise<void>;
  deleteDirectory(path: string, recursive?: boolean): Promise<void>;
  listDirectory(path: string): Promise<FileSystemEntry[]>;
  
  // File info operations
  getFileInfo(path: string): Promise<FileSystemFileInfo>;
  getDirectoryInfo(path: string): Promise<FileSystemDirectoryInfo>;
  
  // Utility operations
  copyFile(source: string, destination: string): Promise<void>;
  moveFile(source: string, destination: string): Promise<void>;
  getFileSize(path: string): Promise<number>;
  getLastModified(path: string): Promise<Date>;
}

// Supporting types
export interface CloudStorageOptions {
  contentType?: string;
  metadata?: Record<string, string>;
  public?: boolean;
  encryption?: StorageEncryptionOptions;
  compression?: boolean;
}

export interface StorageEncryptionOptions {
  algorithm: string;
  key: string;
  iv?: string;
}

export interface CloudStorageUrlOptions {
  expiresIn?: number;
  public?: boolean;
  download?: boolean;
  filename?: string;
}

export interface CloudStorageListOptions {
  maxResults?: number;
  delimiter?: string;
  startOffset?: string;
  endOffset?: string;
}

export interface CloudStorageFile {
  path: string;
  size: number;
  contentType: string;
  lastModified: Date;
  metadata?: Record<string, string>;
  url?: string;
}

export interface DatabaseTransaction {
  commit(): Promise<void>;
  rollback(): Promise<void>;
  query<T>(sql: string, params?: any[]): Promise<T[]>;
  queryOne<T>(sql: string, params?: any[]): Promise<T | null>;
  execute(sql: string, params?: any[]): Promise<void>;
}

export interface DatabaseMigration {
  id: string;
  name: string;
  sql: string;
  timestamp: Date;
  checksum: string;
}

export interface FileSystemEntry {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  lastModified?: Date;
}

export interface FileSystemFileInfo {
  name: string;
  path: string;
  size: number;
  lastModified: Date;
  created: Date;
  isReadOnly: boolean;
  isHidden: boolean;
  permissions: FilePermissions;
}

export interface FileSystemDirectoryInfo {
  name: string;
  path: string;
  lastModified: Date;
  created: Date;
  isReadOnly: boolean;
  isHidden: boolean;
  permissions: FilePermissions;
  fileCount: number;
  directoryCount: number;
}

export interface FilePermissions {
  read: boolean;
  write: boolean;
  execute: boolean;
  owner: string;
  group: string;
}
