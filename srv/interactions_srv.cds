using app.interactions from '../db/interactions';

service DisputeWorkflow {
   
    // Bank Transactions - Read-only access
    @readonly entity BankTransactions as projection on interactions.BankTransactions;
    
    // Merchant Transactions - Read-only access
    @readonly entity MerchantTransactions as projection on interactions.MerchantTransactions;
    
    // Non-Bank Transactions - Read-only access
    @readonly entity NonBankTransactions as projection on interactions.NonBankTransactions;

    // POS Transactions - Read-only access
     @readonly entity POSTransactions as projection on interactions.POSTransactions;
    
    /*
    // Actions for reconciliation processes
    
    // Action to auto-match transactions based on criteria
    action autoMatchTransactions(
        dateFrom: Date,
        dateTo: Date,
        matchingCriteria: String // 'AMOUNT_DATE', 'REFERENCE', 'AMOUNT_ONLY'
    ) returns {
        matchedCount: Integer;
        unmatchedCount: Integer;
        message: String;
    };
    
    // Action to manually reconcile a transaction
    action manualReconcile(
        bankRef: String,
        merchantRef: String,
        nonBankRef: String,
        comments: String
    ) returns {
        success: Boolean;
        reconciliationID: UUID;
        message: String;
    };
    
    // Action to mark transaction as exception
    action markAsException(
        transactionID: String,
        sourceType: String,
        reason: String
    ) returns {
        success: Boolean;
        message: String;
    };
    
    // Action to generate reconciliation report
    action generateReconciliationReport(
        dateFrom: Date,
        dateTo: Date,
        reportType: String // 'SUMMARY', 'DETAILED', 'EXCEPTIONS'
    ) returns {
        reportID: String;
        reportURL: String;
        message: String;
    };
    
    // Function to get matching suggestions for a transaction
    function getMatchingSuggestions(
        transactionID: String,
        sourceType: String,
        amount: Decimal
    ) returns array of {
        candidateID: String;
        candidateSource: String;
        matchScore: Integer; // 0-100
        matchReason: String;
        amount: Decimal;
        date: Date;
    };
    
    // Function to calculate reconciliation metrics
    function getReconciliationMetrics(
        dateFrom: Date,
        dateTo: Date
    ) returns {
        totalBankTransactions: Integer;
        totalMerchantTransactions: Integer;
        totalNonBankTransactions: Integer;
        matchRate: Decimal;
        totalVariance: Decimal;
        exceptionCount: Integer;
    };
    */
}

/*
// Analytics Service for reporting and dashboards
service AnalyticsService {
    
    @readonly entity ReconciliationTrends {
        key month: String;
        matchRate: Decimal;
        totalVolume: Decimal;
        exceptionRate: Decimal;
    };
    
    @readonly entity SourceComparison {
        key source: String;
        transactionCount: Integer;
        totalAmount: Decimal;
        avgTransactionAmount: Decimal;
    };
    
    // Function to get daily reconciliation status
    function getDailyReconciliationStatus(
        targetDate: Date
    ) returns {
        date: Date;
        bankCount: Integer;
        merchantCount: Integer;
        nonBankCount: Integer;
        matchedCount: Integer;
        pendingCount: Integer;
        exceptionCount: Integer;
    };
}
*/