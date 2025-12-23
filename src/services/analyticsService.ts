/**
 * Analytics Service - Track API usage and user activity
 * Uses localStorage for simple implementation
 */

export interface UsageLog {
    id: string;
    timestamp: number;
    type: 'gemini' | 'huggingface';
    action: 'tts' | 'voice-clone';
    charactersProcessed: number;
    voice: string;
    success: boolean;
    error?: string;
}

export interface DailyStats {
    date: string;
    visits: number;
    geminiCalls: number;
    huggingfaceCalls: number;
    totalCharacters: number;
    errors: number;
}

const STORAGE_KEYS = {
    LOGS: 'analytics_logs',
    DAILY_STATS: 'analytics_daily_stats',
    TOTAL_VISITS: 'analytics_total_visits'
};

class AnalyticsService {

    // Track API usage
    trackAPICall(log: Omit<UsageLog, 'id' | 'timestamp'>): void {
        const newLog: UsageLog = {
            ...log,
            id: this.generateId(),
            timestamp: Date.now()
        };

        const logs = this.getLogs();
        logs.push(newLog);

        // Keep only last 1000 logs
        if (logs.length > 1000) {
            logs.shift();
        }

        localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
        this.updateDailyStats(newLog);
    }

    // Track page visit
    trackVisit(): void {
        const today = this.getToday();
        const stats = this.getDailyStats();

        const todayStats = stats.find(s => s.date === today);
        if (todayStats) {
            todayStats.visits++;
        } else {
            stats.push({
                date: today,
                visits: 1,
                geminiCalls: 0,
                huggingfaceCalls: 0,
                totalCharacters: 0,
                errors: 0
            });
        }

        localStorage.setItem(STORAGE_KEYS.DAILY_STATS, JSON.stringify(stats));

        // Increment total visits
        const totalVisits = this.getTotalVisits() + 1;
        localStorage.setItem(STORAGE_KEYS.TOTAL_VISITS, totalVisits.toString());
    }

    // Get all logs
    getLogs(): UsageLog[] {
        const data = localStorage.getItem(STORAGE_KEYS.LOGS);
        return data ? JSON.parse(data) : [];
    }

    // Get daily stats
    getDailyStats(): DailyStats[] {
        const data = localStorage.getItem(STORAGE_KEYS.DAILY_STATS);
        return data ? JSON.parse(data) : [];
    }

    // Get total visits
    getTotalVisits(): number {
        const data = localStorage.getItem(STORAGE_KEYS.TOTAL_VISITS);
        return data ? parseInt(data, 10) : 0;
    }

    // Get stats for today
    getTodayStats(): DailyStats {
        const today = this.getToday();
        const stats = this.getDailyStats();
        const todayStats = stats.find(s => s.date === today);

        return todayStats || {
            date: today,
            visits: 0,
            geminiCalls: 0,
            huggingfaceCalls: 0,
            totalCharacters: 0,
            errors: 0
        };
    }

    // Get stats summary
    getStatsSummary() {
        const logs = this.getLogs();
        const dailyStats = this.getDailyStats();
        const totalVisits = this.getTotalVisits();
        const todayStats = this.getTodayStats();

        const totalGeminiCalls = logs.filter(l => l.type === 'gemini').length;
        const totalHFCalls = logs.filter(l => l.type === 'huggingface').length;
        const totalCharacters = logs.reduce((sum, l) => sum + l.charactersProcessed, 0);
        const totalErrors = logs.filter(l => !l.success).length;

        // Estimated costs
        const geminiCost = this.calculateGeminiCost(logs.filter(l => l.type === 'gemini'));
        const hfCost = this.calculateHFCost(totalHFCalls);

        return {
            totalVisits,
            todayVisits: todayStats.visits,
            totalGeminiCalls,
            totalHFCalls,
            todayGeminiCalls: todayStats.geminiCalls,
            todayHFCalls: todayStats.huggingfaceCalls,
            totalCharacters,
            todayCharacters: todayStats.totalCharacters,
            totalErrors,
            todayErrors: todayStats.errors,
            estimatedCost: geminiCost + hfCost,
            geminiCost,
            hfCost,
            last7Days: this.getLast7DaysStats()
        };
    }

    // Private methods
    private updateDailyStats(log: UsageLog): void {
        const today = this.getToday();
        const stats = this.getDailyStats();

        let todayStats = stats.find(s => s.date === today);
        if (!todayStats) {
            todayStats = {
                date: today,
                visits: 0,
                geminiCalls: 0,
                huggingfaceCalls: 0,
                totalCharacters: 0,
                errors: 0
            };
            stats.push(todayStats);
        }

        if (log.type === 'gemini') todayStats.geminiCalls++;
        if (log.type === 'huggingface') todayStats.huggingfaceCalls++;
        todayStats.totalCharacters += log.charactersProcessed;
        if (!log.success) todayStats.errors++;

        localStorage.setItem(STORAGE_KEYS.DAILY_STATS, JSON.stringify(stats));
    }

    private getLast7DaysStats(): DailyStats[] {
        const stats = this.getDailyStats();
        const last7Days = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const dayStats = stats.find(s => s.date === dateStr) || {
                date: dateStr,
                visits: 0,
                geminiCalls: 0,
                huggingfaceCalls: 0,
                totalCharacters: 0,
                errors: 0
            };

            last7Days.push(dayStats);
        }

        return last7Days;
    }

    private calculateGeminiCost(logs: UsageLog[]): number {
        const totalChars = logs.reduce((sum, l) => sum + l.charactersProcessed, 0);
        const FREE_TIER = 4000000; // 4M characters free per month

        if (totalChars <= FREE_TIER) return 0;

        const billableChars = totalChars - FREE_TIER;
        return (billableChars / 1000) * 0.016; // $0.016 per 1K characters
    }

    private calculateHFCost(calls: number): number {
        const FREE_TIER = 30000; // 30K requests free per month

        if (calls <= FREE_TIER) return 0;

        return 9; // $9/month for Pro tier
    }

    private getToday(): string {
        return new Date().toISOString().split('T')[0];
    }

    private generateId(): string {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Clear all data (for testing)
    clearAllData(): void {
        localStorage.removeItem(STORAGE_KEYS.LOGS);
        localStorage.removeItem(STORAGE_KEYS.DAILY_STATS);
        localStorage.removeItem(STORAGE_KEYS.TOTAL_VISITS);
    }
}

export const analyticsService = new AnalyticsService();
