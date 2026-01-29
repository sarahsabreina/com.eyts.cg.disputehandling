/*
using { ZCG_HANA_DATA_RECON_HDI_ZCG_HANA_DATA_RECON_DB_DEPLOYER_1 as hdi } from '../db/schema';

service DisputeWorkflow {
    // Bank Transactions - Maps to ZBANK table
    @readonly 
    entity BankTransactions as projection on hdi.ZCG_HANA_DATA_RECON_ZBANK;
    
    // Merchant Transactions - Maps to ZMERCHANT table
    @readonly 
    entity MerchantTransactions as projection on hdi.ZCG_HANA_DATA_RECON_ZMERCHANT;
    
    // Non-Bank Transactions - Maps to ZNONBANK table
    @readonly 
    entity NonBankTransactions as projection on hdi.ZCG_HANA_DATA_RECON_ZNONBANK;

    // POS Transactions - Maps to ZPOS table
     @readonly 
    entity POSTransactions as projection on hdi.ZCG_HANA_DATA_RECON_ZPOS;
    
}
*/

using from './project2/annotations';