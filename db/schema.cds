namespace ZCG_HANA_DATA_RECON_HDI_ZCG_HANA_DATA_RECON_DB_DEPLOYER_1;

// Bank Transactions Table
@cds.persistence.exists
entity ZCG_HANA_DATA_RECON_ZBANK {
    key ACCOUNTNUMBER : String(25) not null;
    key RECORDSEQUENCENUMBER : String(15) not null;
    key TRANSACTIONDATE : Date not null;
    key TRANSACTIONCODE : String(15) not null;
    key TRANSACTIONAMOUNT : Decimal(13,2) not null;
    key TRANSACTIONAMOUNTTYPE : String(15) not null;
    TRANSACTIONCODEDESCRIPTION : String(50);
    ORIGINATINGBRANCHCODE : String(15);
    DOCUMENTREFERENCENUMBER : String(15);
    BALANCE : Decimal(13,2);
    BALANCETYPE : String(15);
    TRANSACTIONTIME : Time;
    CUSTOMERREFERENCE : String(15);
    FILLER : String(15);
    RECORDTYPE : String(15);
    RECIPIENTREFERENCE : String(25);
    OTHERPAYMENTDETAILS : String(50);
    SENDERNAME : String(50);
}

// Merchant Transactions Table
@cds.persistence.exists
entity ZCG_HANA_DATA_RECON_ZMERCHANT {
    key MERCHANTID : String(10) not null;
    key EDCTERMINALID : String(10) not null;
    key SETTLEMENTDATE : Date not null;
    key CARDNOTRANSID : String(25) not null;
    key TRANSDATE : Date not null;
    key TRANSTIME : Time not null;
    MERCHANTNAME : String(50);
    EDCBATCHNO : String(10);
    STATEMENTBATCHNO : String(10);
    APPROVALCODE : String(10);
    TRANSAMOUNT : String(10);
    MDRRATE : String(10);
    DISCAMOUNT : String(10);
    NETTAMOUNT : String(10);
    CARDBRAND : String(20);
    INTERCHANGEFEECODE : String(10);
    RPPID : String(10);
    INSTITUTIONNAME : String(50);
    ACCOUNTTYPE : String(10);
    NAME : String(10);
    MERCHANTTRANSACTIONID : String(10);
}

// Non-Bank Transactions Table
@cds.persistence.exists
entity ZCG_HANA_DATA_RECON_ZNONBANK {
    key DATE :  Date not null;
    key ORDERID : String(15) not null;
    TRANSACTIONTYPE : String(15);
    DESCRIPTION : String(50);
    MONEYDIRECTION : String(25);
    AMOUNT : Decimal(13,2);
    STATUS : String(50);
    BALANCEAFTERTRANSACTIONS : Decimal(13,2);
}

// POS Transactions Table  
@cds.persistence.exists
entity ZCG_HANA_DATA_RECON_ZPOS {
    key TRANSACTIONID : String(15) not null;
    key MERCHANTID: String(10) not null;
    key TYPE : String(50) not null;
    key REFNO : String(15) not null;
    key SKU : String(15) not null;
    key PRODUCT : String(15) not null;
    key LOCATION : String(15) not null;
    key SALESDATE : Date not null;
    key PAYMENTMETHOD : String(50) not null;
    STATUS : String(15);
    INFO : String(50);
    QUANTITY : Integer;
    GROSSSALES : Decimal(13,2);
    DISCOUNT : Decimal(5,2);
    NETAMOUNT : Decimal(13,2) not null;
}
