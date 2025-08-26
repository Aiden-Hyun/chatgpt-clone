import { AIModel, ChatMessage, SearchResult } from '../domain/types';

// External service interfaces
export interface AIProviderService {
  sendMessage(request: AIRequest): Promise<AIResponse>;
  sendMessageStream(request: AIRequest): Promise<AIStreamResponse>;
  getModels(): Promise<AIModel[]>;
  getModelInfo(modelId: string): Promise<AIModel | null>;
  validateModel(modelId: string): Promise<boolean>;
  getUsage(): Promise<AIUsage>;
  getCosts(): Promise<AICost[]>;
}

export interface SearchProviderService {
  search(query: string, options?: SearchOptions): Promise<SearchResult[]>;
  searchImages(query: string, options?: SearchOptions): Promise<SearchResult[]>;
  searchNews(query: string, options?: SearchOptions): Promise<SearchResult[]>;
  searchAcademic(query: string, options?: SearchOptions): Promise<SearchResult[]>;
  getSearchSuggestions(query: string): Promise<string[]>;
  getSearchHistory(): Promise<SearchHistoryItem[]>;
}

export interface EmailService {
  sendEmail(to: string, subject: string, body: string, options?: EmailOptions): Promise<void>;
  sendTemplateEmail(templateId: string, to: string, data: Record<string, any>): Promise<void>;
  sendBulkEmail(emails: BulkEmailRequest[]): Promise<BulkEmailResult>;
  verifyEmail(email: string): Promise<EmailVerificationResult>;
  getEmailStatus(messageId: string): Promise<EmailStatus>;
}

export interface SMSService {
  sendSMS(to: string, message: string, options?: SMSOptions): Promise<void>;
  sendBulkSMS(messages: BulkSMSRequest[]): Promise<BulkSMSResult>;
  verifyPhoneNumber(phone: string): Promise<PhoneVerificationResult>;
  getSMSStatus(messageId: string): Promise<SMSStatus>;
}

export interface PushNotificationService {
  sendNotification(notification: PushNotification, options?: PushOptions): Promise<void>;
  sendToTopic(topic: string, notification: PushNotification): Promise<void>;
  sendToUser(userId: string, notification: PushNotification): Promise<void>;
  subscribeToTopic(userId: string, topic: string): Promise<void>;
  unsubscribeFromTopic(userId: string, topic: string): Promise<void>;
  getDeviceTokens(userId: string): Promise<string[]>;
}

export interface PaymentService {
  createPaymentIntent(amount: number, currency: string, options?: PaymentOptions): Promise<PaymentIntent>;
  confirmPayment(paymentIntentId: string, paymentMethod: string): Promise<PaymentResult>;
  refundPayment(paymentIntentId: string, amount?: number): Promise<RefundResult>;
  getPaymentHistory(userId: string): Promise<PaymentHistoryItem[]>;
  createSubscription(subscriptionData: SubscriptionData): Promise<Subscription>;
  cancelSubscription(subscriptionId: string): Promise<void>;
}

export interface AnalyticsService {
  trackEvent(event: AnalyticsEvent): Promise<void>;
  trackPageView(page: string, properties?: Record<string, any>): Promise<void>;
  trackUser(userId: string, properties?: Record<string, any>): Promise<void>;
  getMetrics(metric: string, options?: MetricsOptions): Promise<MetricResult>;
  getFunnel(funnelId: string, options?: FunnelOptions): Promise<FunnelResult>;
}

export interface MonitoringService {
  logError(error: Error, context?: Record<string, any>): Promise<void>;
  logWarning(message: string, context?: Record<string, any>): Promise<void>;
  logInfo(message: string, context?: Record<string, any>): Promise<void>;
  setMetric(name: string, value: number, tags?: Record<string, string>): Promise<void>;
  incrementMetric(name: string, value?: number, tags?: Record<string, string>): Promise<void>;
  getHealthCheck(): Promise<HealthCheckResult>;
}

// Request/Response types
export interface AIRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
  stream?: boolean;
}

export interface AIResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: string;
  metadata?: Record<string, any>;
}

export interface AIStreamResponse {
  stream: AsyncIterable<AIStreamChunk>;
  cancel(): void;
}

export interface AIStreamChunk {
  content: string;
  isComplete: boolean;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIUsage {
  totalTokens: number;
  totalCost: number;
  dailyUsage: Record<string, number>;
  monthlyUsage: Record<string, number>;
}

export interface AICost {
  model: string;
  inputCostPerToken: number;
  outputCostPerToken: number;
  currency: string;
}

export interface SearchOptions {
  maxResults?: number;
  timeRange?: 'day' | 'week' | 'month' | 'year' | 'all';
  language?: string;
  region?: string;
  safeSearch?: boolean;
  type?: 'web' | 'images' | 'news' | 'academic';
}

export interface SearchHistoryItem {
  query: string;
  timestamp: Date;
  resultCount: number;
  clickedResults: string[];
}

export interface EmailOptions {
  from?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: EmailAttachment[];
  priority?: 'low' | 'normal' | 'high';
}

export interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentType: string;
}

export interface BulkEmailRequest {
  to: string;
  subject: string;
  body: string;
  data?: Record<string, any>;
}

export interface BulkEmailResult {
  successCount: number;
  failureCount: number;
  failures: Array<{ email: string; error: string }>;
}

export interface EmailVerificationResult {
  isValid: boolean;
  score: number;
  suggestions: string[];
}

export interface EmailStatus {
  messageId: string;
  status: 'sent' | 'delivered' | 'bounced' | 'failed';
  timestamp: Date;
  details?: Record<string, any>;
}

export interface SMSOptions {
  from?: string;
  priority?: 'low' | 'normal' | 'high';
  scheduledAt?: Date;
}

export interface BulkSMSRequest {
  to: string;
  message: string;
  scheduledAt?: Date;
}

export interface BulkSMSResult {
  successCount: number;
  failureCount: number;
  failures: Array<{ phone: string; error: string }>;
}

export interface PhoneVerificationResult {
  isValid: boolean;
  carrier?: string;
  country?: string;
}

export interface SMSStatus {
  messageId: string;
  status: 'sent' | 'delivered' | 'failed';
  timestamp: Date;
  cost?: number;
}

export interface PushNotification {
  title: string;
  body: string;
  data?: Record<string, any>;
  image?: string;
  action?: {
    type: string;
    url?: string;
  };
}

export interface PushOptions {
  priority?: 'normal' | 'high';
  ttl?: number;
  badge?: number;
  sound?: string;
}

export interface PaymentOptions {
  description?: string;
  metadata?: Record<string, string>;
  customerId?: string;
  paymentMethodTypes?: string[];
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret: string;
}

export interface PaymentResult {
  success: boolean;
  paymentIntentId: string;
  amount: number;
  currency: string;
  status: string;
}

export interface RefundResult {
  success: boolean;
  refundId: string;
  amount: number;
  status: string;
}

export interface PaymentHistoryItem {
  id: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  timestamp: Date;
}

export interface SubscriptionData {
  customerId: string;
  priceId: string;
  quantity?: number;
  metadata?: Record<string, string>;
}

export interface Subscription {
  id: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  userId?: string;
  timestamp?: Date;
}

export interface MetricsOptions {
  startDate: Date;
  endDate: Date;
  interval?: 'hour' | 'day' | 'week' | 'month';
  filters?: Record<string, any>;
}

export interface MetricResult {
  metric: string;
  values: Array<{ timestamp: Date; value: number }>;
  total: number;
  average: number;
}

export interface FunnelOptions {
  startDate: Date;
  endDate: Date;
  steps: string[];
}

export interface FunnelResult {
  funnelId: string;
  steps: Array<{
    step: string;
    count: number;
    conversionRate: number;
  }>;
  totalConversionRate: number;
}

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: Array<{
    name: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    responseTime: number;
    error?: string;
  }>;
  timestamp: Date;
}
