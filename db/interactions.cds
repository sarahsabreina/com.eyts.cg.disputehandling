namespace app.interactions;

using { ZCG_HANA_DATA_RECON_HDI_ZCG_HANA_DATA_RECON_DB_DEPLOYER_1 as hdi } from '../db/schema';
/*
using { ZCG_HANA_DATA_RECON_HDI_ZCG_HANA_DATA_RECON_DB_DEPLOYER_1.ZCG_HANA_DATA_RECON_ZBANK as BankTable } from '../db/schema';
using { ZCG_HANA_DATA_RECON_HDI_ZCG_HANA_DATA_RECON_DB_DEPLOYER_1.ZCG_HANA_DATA_RECON_ZMERCHANT as MerchantTable } from '../db/schema';
using { ZCG_HANA_DATA_RECON_HDI_ZCG_HANA_DATA_RECON_DB_DEPLOYER_1.ZCG_HANA_DATA_RECON_ZNONBANK as NonBankTable } from '../db/schema';
*/

// Bank Transaction Entity
entity BankTransactions as projection on hdi.ZCG_HANA_DATA_RECON_ZBANK {
    key ACCOUNTNUMBER,
    key RECORDSEQUENCENUMBER,
    key TRANSACTIONDATE,
    key TRANSACTIONCODE,
    key TRANSACTIONAMOUNT,
    key TRANSACTIONAMOUNTTYPE,
    TRANSACTIONCODEDESCRIPTION,
    ORIGINATINGBRANCHCODE,
    DOCUMENTREFERENCENUMBER,
    BALANCE,
    BALANCETYPE,
    TRANSACTIONTIME,
    CUSTOMERREFERENCE,
    FILLER,
    RECORDTYPE,
    RECIPIENTREFERENCE,
    OTHERPAYMENTDETAILS,
    SENDERNAME,
};

// Merchant Transaction Entity
entity MerchantTransactions as projection on hdi.ZCG_HANA_DATA_RECON_ZMERCHANT {
    key MERCHANTID,
    key EDCTERMINALID,
    key SETTLEMENTDATE,
    key CARDNOTRANSID,
    key TRANSDATE,
    key TRANSTIME,
    MERCHANTNAME,
    EDCBATCHNO,
    STATEMENTBATCHNO,
    APPROVALCODE,
    TRANSAMOUNT,
    MDRRATE,
    DISCAMOUNT,
    NETTAMOUNT,
    CARDBRAND,
    INTERCHANGEFEECODE,
    RPPID,
    INSTITUTIONNAME,
    ACCOUNTTYPE,
    NAME,
    MERCHANTTRANSACTIONID
};

// Non-Bank Transaction Entity
entity NonBankTransactions as projection on hdi.ZCG_HANA_DATA_RECON_ZNONBANK {
    key DATE,
    key ORDERID,
    TRANSACTIONTYPE,
    DESCRIPTION,
    MONEYDIRECTION,
    AMOUNT,
    STATUS,
    BALANCEAFTERTRANSACTIONS,
};

// POS Transactions Table  
entity POSTransactions as projection on hdi.ZCG_HANA_DATA_RECON_ZPOS{
    key TRANSACTIONID,
    key MERCHANTID,
    key TYPE,
    key REFNO,
    key SKU,
    key PRODUCT,
    key LOCATION,
    key SALESDATE,
    key PAYMENTMETHOD,
    STATUS,
    INFO,
    QUANTITY,
    GROSSSALES,
    DISCOUNT,
    NETAMOUNT
};

/*
// Reconciliation Status Entity (for tracking matching status)
entity ReconciliationStatus {
    key ID : UUID;
    bankTransactionRef : String(50);
    merchantTransactionRef : String(50);
    nonBankTransactionRef : String(50);
    matchStatus : String(20); // 'MATCHED', 'UNMATCHED', 'PARTIAL', 'PENDING'
    matchedAmount : Decimal(13,2);
    varianceAmount : Decimal(13,2);
    reconciliationDate : Date;
    reconciliationType : String(30); // 'BANK_MERCHANT', 'BANK_NONBANK', 'ALL'
    comments : String(500);
    reconciledBy : String(100);
    createdAt : Timestamp;
    modifiedAt : Timestamp;
}

// Reconciliation Summary View
entity ReconciliationSummary {
    key reconDate : Date;
    key sourceType : String(20); // 'BANK', 'MERCHANT', 'NONBANK'
    totalTransactions : Integer;
    totalAmount : Decimal(15,2);
    matchedTransactions : Integer;
    matchedAmount : Decimal(15,2);
    unmatchedTransactions : Integer;
    unmatchedAmount : Decimal(15,2);
    varianceAmount : Decimal(15,2);
}

// Unmatched Transactions View (for exceptions)
entity UnmatchedTransactions {
    key transactionID : String(50);
    transactionDate : Date;
    sourceType : String(20); // 'BANK', 'MERCHANT', 'NONBANK'
    amount : Decimal(13,2);
    reference : String(100);
    reason : String(200); // 'NO_MATCH_FOUND', 'AMOUNT_MISMATCH', 'DATE_MISMATCH'
    agingDays : Integer;
}
*/