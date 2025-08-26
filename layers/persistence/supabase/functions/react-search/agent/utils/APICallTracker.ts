export interface APICall {
  id: string;
  timestamp: Date;
  purpose: string;
  model: string;
  provider: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  responseTimeMs: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

export class APICallTracker {
  private calls: APICall[] = [];
  private startTime: Date;

  constructor() {
    this.startTime = new Date();
  }

  /**
   * Track an API call
   */
  trackCall(call: Omit<APICall, 'id' | 'timestamp'>): string {
    const id = `api_${this.calls.length + 1}`;
    const apiCall: APICall = {
      ...call,
      id,
      timestamp: new Date()
    };
    
    this.calls.push(apiCall);
    
    // Log the call immediately
    console.log(`📊 [APICallTracker] ${apiCall.purpose} - ${apiCall.provider}/${apiCall.model} - ${apiCall.responseTimeMs}ms - ${apiCall.totalTokens || 'unknown'} tokens`);
    
    return id;
  }

  /**
   * Get all tracked calls
   */
  getCalls(): APICall[] {
    return [...this.calls];
  }

  /**
   * Get summary statistics
   */
  getSummary() {
    const totalCalls = this.calls.length;
    const totalTime = this.calls.reduce((sum, call) => sum + call.responseTimeMs, 0);
    const totalTokens = this.calls.reduce((sum, call) => sum + (call.totalTokens || 0), 0);
    const totalInputTokens = this.calls.reduce((sum, call) => sum + (call.inputTokens || 0), 0);
    const totalOutputTokens = this.calls.reduce((sum, call) => sum + (call.outputTokens || 0), 0);
    const successfulCalls = this.calls.filter(call => call.success).length;
    const failedCalls = totalCalls - successfulCalls;
    
    const callsByPurpose = this.calls.reduce((acc, call) => {
      acc[call.purpose] = (acc[call.purpose] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const callsByProvider = this.calls.reduce((acc, call) => {
      acc[call.provider] = (acc[call.provider] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalCalls,
      totalTime,
      totalTokens,
      totalInputTokens,
      totalOutputTokens,
      successfulCalls,
      failedCalls,
      callsByPurpose,
      callsByProvider,
      averageTime: totalCalls > 0 ? totalTime / totalCalls : 0,
      averageTokens: totalCalls > 0 ? totalTokens / totalCalls : 0
    };
  }

  /**
   * Print detailed summary
   */
  printSummary() {
    const summary = this.getSummary();
    const totalTimeSeconds = (Date.now() - this.startTime.getTime()) / 1000;
    
    // Build summary sections
    const overview = [
      `📊 [APICallTracker] ===== API CALL SUMMARY =====\n`,
      `📊 [APICallTracker] Total execution time: ${totalTimeSeconds.toFixed(2)}s\n`,
      `📊 [APICallTracker] Total API calls: ${summary.totalCalls}\n`,
      `📊 [APICallTracker] Successful calls: ${summary.successfulCalls}\n`,
      `📊 [APICallTracker] Failed calls: ${summary.failedCalls}\n`,
      `📊 [APICallTracker] Total response time: ${summary.totalTime}ms\n`,
      `📊 [APICallTracker] Average response time: ${summary.averageTime.toFixed(0)}ms\n`,
      `📊 [APICallTracker] Total tokens used: ${summary.totalTokens.toLocaleString()}\n`,
      `📊 [APICallTracker] Input tokens: ${summary.totalInputTokens.toLocaleString()}\n`,
      `📊 [APICallTracker] Output tokens: ${summary.totalOutputTokens.toLocaleString()}\n`,
      `📊 [APICallTracker] Average tokens per call: ${summary.averageTokens.toFixed(0)}`
    ].join('');
    
    const purposeBreakdown = [
      `📊 [APICallTracker] Calls by purpose:\n`,
      ...Object.entries(summary.callsByPurpose).map(([purpose, count]) => 
        `📊 [APICallTracker]   ${purpose}: ${count} call(s)\n`
      )
    ].join('');
    
    const providerBreakdown = [
      `📊 [APICallTracker] Calls by provider:\n`,
      ...Object.entries(summary.callsByProvider).map(([provider, count]) => 
        `📊 [APICallTracker]   ${provider}: ${count} call(s)\n`
      )
    ].join('');
    
    const detailedLog = [
      `📊 [APICallTracker] Detailed call log:\n`,
      ...this.calls.map((call, index) => {
        const status = call.success ? '✅' : '❌';
        const tokens = call.totalTokens ? `${call.totalTokens.toLocaleString()} tokens` : 'unknown tokens';
        const line = `📊 [APICallTracker] ${index + 1}. ${status} ${call.purpose} - ${call.provider}/${call.model} - ${call.responseTimeMs}ms - ${tokens}\n`;
        return call.error ? `${line}📊 [APICallTracker]    Error: ${call.error}\n` : line;
      })
    ].join('');
    
    const footer = `📊 [APICallTracker] ===== END SUMMARY =====\n`;
    
    // Single console.log with all information
    console.log(`\n${overview}\n${purposeBreakdown}\n${providerBreakdown}\n${detailedLog}\n${footer}`);
  }

  /**
   * Reset the tracker
   */
  reset() {
    this.calls = [];
    this.startTime = new Date();
  }
}
