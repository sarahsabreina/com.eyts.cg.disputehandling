sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (
    Controller,
    JSONModel,
    Filter,
    FilterOperator,
    Sorter,
    MessageToast,
    MessageBox
) {
    "use strict";

    return Controller.extend("project2.controller.View2", {

        formatter: {
            formatRecurring: function(isRecurring) {
                return isRecurring ? "🔁 Recurring" : "";
            },
            
            amountState: function(amount) {
                if (!amount) return "None";
                return amount > 10000 ? "Error" : "Warning";
            },
            
            statusState: function(status) {
                const states = {
                    "SUBMITTED": "Warning",
                    "IN REVIEW": "Information",
                    "NEED INFO": "Warning",
                    "RESOLVED": "Success",
                    "REJECTED": "Error",
                    "READY TO CLOSE": "Success"
                };
                return states[status] || "None";
            },
            
            priorityState: function(priority) {
                const states = {
                    "HIGH": "Error",
                    "MEDIUM": "Warning",
                    "LOW": "Information"
                };
                return states[priority] || "None";
            },
            
            priorityIcon: function(priority) {
                const icons = {
                    "HIGH": "sap-icon://warning",
                    "MEDIUM": "sap-icon://alert",
                    "LOW": "sap-icon://message-information"
                };
                return icons[priority] || "sap-icon://circle-task";
            },
            
            priorityColor: function(priority) {
                const colors = {
                    "HIGH": "#BB0000",
                    "MEDIUM": "#E78C07",
                    "LOW": "#0A6ED1"
                };
                return colors[priority] || "#666666";
            },
            
            formatRelativeDate: function(date) {
                if (!date) return "-";
                const now = new Date();
                const then = new Date(date);
                const diffMs = now - then;
                const diffMins = Math.floor(diffMs / 60000);
                const diffHours = Math.floor(diffMs / 3600000);
                const diffDays = Math.floor(diffMs / 86400000);
                
                if (diffMins < 60) return diffMins + "m ago";
                if (diffHours < 24) return diffHours + "h ago";
                if (diffDays < 7) return diffDays + "d ago";
                return then.toLocaleDateString();
            },
            
            slaState: function(slaStatus) {
                const states = {
                    "ON TRACK": "Success",
                    "AT RISK": "Warning",
                    "BREACHED": "Error"
                };
                return states[slaStatus] || "None";
            },
            
            slaPercentage: function(remainingHours) {
                if (!remainingHours) return 0;
                const totalHours = 120; // 5 days
                return Math.min(100, Math.max(0, (remainingHours / totalHours) * 100));
            }
        },

        onInit: function () {
            // Initialize view model for UI state
            const oViewModel = new JSONModel({
                busy: false,
                viewMode: "table",
                selectedTab: "all",
                selectedItems: 0,
                filterDateFrom: this._getFormattedDate(-30), // 30 days ago
                filterDateTo: this._getFormattedDate(0), // today
                selectedDateRange: "month",
                autoRefresh: false,
                lastSyncTime: new Date().toLocaleTimeString(),
                counts: {
                    new: 0,
                    mine: 0,
                    overdue: 0,
                    all: 0
                },
                kanban: {
                    submitted: 0,
                    inReview: 0,
                    needInfo: 0,
                    readyToClose: 0
                }
            });
            this.getView().setModel(oViewModel, "viewModel");

            // Initialize mock data model
            this._initializeMockData();

            // Initial data load with date filter
            this._applyInitialFilters();
        },

        _applyInitialFilters: function() {
            // Use setTimeout to ensure the view is fully rendered
            setTimeout(() => {
                this.applyAllFilters();
            }, 200);
        },

        _initializeMockData: function() {
            // Mock dispute cases data with various dates
            const mockData = {
                DisputeCases: [
                    // TODAY
                    {
                        caseID: "C110",
                        category: "Missing Entry",
                        status: "SUBMITTED",
                        priority: "HIGH",
                        impactAmount: 120000,
                        slaRemainingHours: 24,
                        slaStatus: "ON TRACK",
                        isRecurring: true,
                        modifiedAt: new Date().toISOString(),
                        createdAt: new Date().toISOString(),
                        discrepancy: { discrepancyID: "D110", type: "Missing Entry" },
                        submitter: { ID: "U001", firstName: "John", lastName: "Smith" },
                        assignee: null,
                        modifiedBy: { firstName: "John", lastName: "Smith" }
                    },
                    {
                        caseID: "C111",
                        category: "Amount Mismatch",
                        status: "IN REVIEW",
                        priority: "MEDIUM",
                        impactAmount: 50000,
                        slaRemainingHours: 48,
                        slaStatus: "ON TRACK",
                        isRecurring: false,
                        modifiedAt: new Date().toISOString(),
                        createdAt: new Date().toISOString(),
                        discrepancy: { discrepancyID: "D111", type: "Amount Mismatch" },
                        submitter: { ID: "U002", firstName: "Sarah", lastName: "Johnson" },
                        assignee: { ID: "U999", firstName: "You", lastName: "", workload: 5 },
                        modifiedBy: { firstName: "You", lastName: "" }
                    },
                    
                    // 1 DAY AGO
                    {
                        caseID: "C109",
                        category: "Duplicate Entry",
                        status: "SUBMITTED",
                        priority: "HIGH",
                        impactAmount: 85000,
                        slaRemainingHours: 20,
                        slaStatus: "ON TRACK",
                        isRecurring: false,
                        modifiedAt: new Date(Date.now() - 86400000).toISOString(),
                        createdAt: new Date(Date.now() - 86400000).toISOString(),
                        discrepancy: { discrepancyID: "D109", type: "Duplicate" },
                        submitter: { ID: "U003", firstName: "Mike", lastName: "Chen" },
                        assignee: null,
                        modifiedBy: { firstName: "Mike", lastName: "Chen" }
                    },
                    
                    // 2 DAYS AGO
                    {
                        caseID: "C108",
                        category: "Amount Variance",
                        status: "IN REVIEW",
                        priority: "MEDIUM",
                        impactAmount: 45000,
                        slaRemainingHours: 40,
                        slaStatus: "ON TRACK",
                        isRecurring: false,
                        modifiedAt: new Date(Date.now() - 172800000).toISOString(),
                        createdAt: new Date(Date.now() - 172800000).toISOString(),
                        discrepancy: { discrepancyID: "D108", type: "Amount Variance" },
                        submitter: { ID: "U004", firstName: "Alice", lastName: "Wong" },
                        assignee: { ID: "U999", firstName: "You", lastName: "", workload: 5 },
                        modifiedBy: { firstName: "You", lastName: "" }
                    },
                    
                    // 3 DAYS AGO
                    {
                        caseID: "C107",
                        category: "Date Discrepancy",
                        status: "NEED INFO",
                        priority: "LOW",
                        impactAmount: 12000,
                        slaRemainingHours: 60,
                        slaStatus: "ON TRACK",
                        isRecurring: false,
                        modifiedAt: new Date(Date.now() - 259200000).toISOString(),
                        createdAt: new Date(Date.now() - 259200000).toISOString(),
                        discrepancy: { discrepancyID: "D107", type: "Date Mismatch" },
                        submitter: { ID: "U005", firstName: "Bob", lastName: "Miller" },
                        assignee: { ID: "U006", firstName: "Sarah", lastName: "Johnson", workload: 3 },
                        modifiedBy: { firstName: "Sarah", lastName: "Johnson" }
                    },
                    
                    // 5 DAYS AGO
                    {
                        caseID: "C106",
                        category: "Missing Entry",
                        status: "SUBMITTED",
                        priority: "HIGH",
                        impactAmount: 95000,
                        slaRemainingHours: 10,
                        slaStatus: "AT RISK",
                        isRecurring: true,
                        modifiedAt: new Date(Date.now() - 432000000).toISOString(),
                        createdAt: new Date(Date.now() - 432000000).toISOString(),
                        discrepancy: { discrepancyID: "D106", type: "Missing Entry" },
                        submitter: { ID: "U001", firstName: "John", lastName: "Smith" },
                        assignee: null,
                        modifiedBy: { firstName: "John", lastName: "Smith" }
                    },
                    
                    // 7 DAYS AGO
                    {
                        caseID: "C105",
                        category: "Amount Mismatch",
                        status: "IN REVIEW",
                        priority: "MEDIUM",
                        impactAmount: 34000,
                        slaRemainingHours: 80,
                        slaStatus: "ON TRACK",
                        isRecurring: false,
                        modifiedAt: new Date(Date.now() - 604800000).toISOString(),
                        createdAt: new Date(Date.now() - 604800000).toISOString(),
                        discrepancy: { discrepancyID: "D105", type: "Amount Mismatch" },
                        submitter: { ID: "U002", firstName: "Sarah", lastName: "Johnson" },
                        assignee: { ID: "U999", firstName: "You", lastName: "", workload: 5 },
                        modifiedBy: { firstName: "You", lastName: "" }
                    },
                    
                    // 10 DAYS AGO
                    {
                        caseID: "C104",
                        category: "Tax Discrepancy",
                        status: "READY TO CLOSE",
                        priority: "LOW",
                        impactAmount: 8000,
                        slaRemainingHours: 100,
                        slaStatus: "ON TRACK",
                        isRecurring: false,
                        modifiedAt: new Date(Date.now() - 864000000).toISOString(),
                        createdAt: new Date(Date.now() - 864000000).toISOString(),
                        discrepancy: { discrepancyID: "D104", type: "Tax Calculation" },
                        submitter: { ID: "U003", firstName: "Mike", lastName: "Chen" },
                        assignee: { ID: "U999", firstName: "You", lastName: "", workload: 5 },
                        modifiedBy: { firstName: "You", lastName: "" }
                    },
                    
                    // 15 DAYS AGO
                    {
                        caseID: "C103",
                        category: "Wrong GL Account",
                        status: "NEED INFO",
                        priority: "HIGH",
                        impactAmount: 67000,
                        slaRemainingHours: 5,
                        slaStatus: "AT RISK",
                        isRecurring: false,
                        modifiedAt: new Date(Date.now() - 1296000000).toISOString(),
                        createdAt: new Date(Date.now() - 1296000000).toISOString(),
                        discrepancy: { discrepancyID: "D103", type: "GL Mismatch" },
                        submitter: { ID: "U004", firstName: "Alice", lastName: "Wong" },
                        assignee: { ID: "U006", firstName: "Sarah", lastName: "Johnson", workload: 3 },
                        modifiedBy: { firstName: "Sarah", lastName: "Johnson" }
                    },
                    
                    // 20 DAYS AGO
                    {
                        caseID: "C102",
                        category: "Amount Variance",
                        status: "SUBMITTED",
                        priority: "MEDIUM",
                        impactAmount: 23000,
                        slaRemainingHours: 0,
                        slaStatus: "BREACHED",
                        isRecurring: false,
                        modifiedAt: new Date(Date.now() - 1728000000).toISOString(),
                        createdAt: new Date(Date.now() - 1728000000).toISOString(),
                        discrepancy: { discrepancyID: "D102", type: "Amount Variance" },
                        submitter: { ID: "U005", firstName: "Bob", lastName: "Miller" },
                        assignee: null,
                        modifiedBy: { firstName: "Bob", lastName: "Miller" }
                    },
                    
                    // 25 DAYS AGO
                    {
                        caseID: "C101",
                        category: "Duplicate Entry",
                        status: "IN REVIEW",
                        priority: "LOW",
                        impactAmount: 15000,
                        slaRemainingHours: 0,
                        slaStatus: "BREACHED",
                        isRecurring: false,
                        modifiedAt: new Date(Date.now() - 2160000000).toISOString(),
                        createdAt: new Date(Date.now() - 2160000000).toISOString(),
                        discrepancy: { discrepancyID: "D101", type: "Duplicate" },
                        submitter: { ID: "U001", firstName: "John", lastName: "Smith" },
                        assignee: { ID: "U999", firstName: "You", lastName: "", workload: 5 },
                        modifiedBy: { firstName: "You", lastName: "" }
                    },
                    
                    // 31 DAYS AGO (Outside month range by default)
                    {
                        caseID: "C100",
                        category: "Missing Entry",
                        status: "SUBMITTED",
                        priority: "HIGH",
                        impactAmount: 150000,
                        slaRemainingHours: 0,
                        slaStatus: "BREACHED",
                        isRecurring: true,
                        modifiedAt: new Date(Date.now() - 2678400000).toISOString(),
                        createdAt: new Date(Date.now() - 2678400000).toISOString(),
                        discrepancy: { discrepancyID: "D100", type: "Missing Entry" },
                        submitter: { ID: "U002", firstName: "Sarah", lastName: "Johnson" },
                        assignee: null,
                        modifiedBy: { firstName: "Sarah", lastName: "Johnson" }
                    }
                ]
            };

            // Set the mock data model
            const oDataModel = new JSONModel(mockData);
            this.getView().setModel(oDataModel);
        },

        // ==================== DATE FILTER FUNCTIONS (CORRECTED) ====================

        /**
         * Get formatted date with offset
         * @param {number} daysOffset - Number of days to offset from today
         * @returns {string} - Formatted date string (YYYY-MM-DD)
         */
        _getFormattedDate: function (daysOffset) {
            var date = new Date();
            date.setDate(date.getDate() + daysOffset);
            // Ensure proper format YYYY-MM-DD
            var year = date.getFullYear();
            var month = String(date.getMonth() + 1).padStart(2, '0');
            var day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        },

        /**
         * Quick date filter selection (Today, Week, Month)
         */
        onQuickDateFilter: function (oEvent) {
            var sKey = oEvent.getParameter("item").getKey();
            var oViewModel = this.getView().getModel("viewModel");
            var fromDate, toDate;

            switch (sKey) {
                case "today":
                    fromDate = this._getFormattedDate(0);
                    toDate = this._getFormattedDate(0);
                    break;
                case "week":
                    fromDate = this._getFormattedDate(-7);
                    toDate = this._getFormattedDate(0);
                    break;
                case "month":
                    fromDate = this._getFormattedDate(-30);
                    toDate = this._getFormattedDate(0);
                    break;
                case "custom":
                    // Keep current dates - user will manually change them
                    return;
            }

            // Update view model
            oViewModel.setProperty("/filterDateFrom", fromDate);
            oViewModel.setProperty("/filterDateTo", toDate);
            oViewModel.setProperty("/selectedDateRange", sKey);

            // Apply all filters
            this.applyAllFilters();
            
            // Show feedback
            MessageToast.show(`Date filter: ${sKey.toUpperCase()} (${fromDate} to ${toDate})`);
        },

        /**
         * Manual date change handler
         */
        onDateChange: function () {
            var oViewModel = this.getView().getModel("viewModel");
            
            // Mark as custom range
            oViewModel.setProperty("/selectedDateRange", "custom");
            
            // Apply all filters
            this.applyAllFilters();
            
            var sDateFrom = oViewModel.getProperty("/filterDateFrom");
            var sDateTo = oViewModel.getProperty("/filterDateTo");
            MessageToast.show(`Custom date range: ${sDateFrom} to ${sDateTo}`);
        },

        /**
         * Refresh data with current filters
         */
        onRefreshData: function () {
            var oViewModel = this.getView().getModel("viewModel");
            
            sap.ui.core.BusyIndicator.show(0);
            
            // Simulate API call
            setTimeout(() => {
                // Update last sync time
                var currentTime = new Date().toLocaleTimeString();
                oViewModel.setProperty("/lastSyncTime", currentTime);

                // Refresh mock data (in real scenario, this would be an OData read)
                this._initializeMockData();

                // Reapply all current filters
                this.applyAllFilters();

                sap.ui.core.BusyIndicator.hide();
                
                var sDateFrom = oViewModel.getProperty("/filterDateFrom");
                var sDateTo = oViewModel.getProperty("/filterDateTo");
                MessageToast.show(`✓ Refreshed at ${currentTime}\nDate range: ${sDateFrom} to ${sDateTo}`);
            }, 800);
        },

        /**
         * Toggle auto-refresh
         */
        onAutoRefreshToggle: function (oEvent) {
            var bState = oEvent.getParameter("state");

            if (bState) {
                // Start auto-refresh every 2 minutes
                this._autoRefreshInterval = setInterval(() => {
                    console.log("Auto-refresh triggered");
                    this.onRefreshData();
                }, 120000); // 2 minutes

                MessageToast.show("🔄 Auto-refresh enabled (every 2 minutes)");
            } else {
                // Stop auto-refresh
                if (this._autoRefreshInterval) {
                    clearInterval(this._autoRefreshInterval);
                    this._autoRefreshInterval = null;
                }
                MessageToast.show("⏸ Auto-refresh disabled");
            }
        },

        /**
         * Apply all filters (date + tab + search)
         * This is the main filter orchestrator
         */
        applyAllFilters: function () {
            var oViewModel = this.getView().getModel("viewModel");
            var sDateFrom = oViewModel.getProperty("/filterDateFrom");
            var sDateTo = oViewModel.getProperty("/filterDateTo");
            var sCurrentTab = oViewModel.getProperty("/selectedTab");
            
            // Get search value if any
            var oSearchField = this.byId("searchField");
            var sSearchQuery = oSearchField ? oSearchField.getValue() : "";

            // Apply filters
            this._filterDisputeData(sCurrentTab, sDateFrom, sDateTo, sSearchQuery);
        },

        /**
         * Core filter logic - handles date, tab, and search filtering
         * @private
         */
        _filterDisputeData: function(sTab, sDateFrom, sDateTo, sSearchQuery) {
            const oTable = this.byId("caseList");
            if (!oTable) {
                console.error("Table 'caseList' not found");
                return;
            }

            const oBinding = oTable.getBinding("items");
            if (!oBinding) {
                console.error("Table binding not found");
                return;
            }

            let aFilters = [];

            // ===== 1. DATE FILTER =====
            if (sDateFrom && sDateTo) {
                var oDateFrom = new Date(sDateFrom + "T00:00:00.000Z");
                var oDateTo = new Date(sDateTo + "T23:59:59.999Z");
                
                console.log("Date Filter Range:", oDateFrom, "to", oDateTo);
                
                // Custom test function for precise date filtering
                var fnDateTest = function(sCreatedAt) {
                    if (!sCreatedAt) return false;
                    
                    var oCreatedDate = new Date(sCreatedAt);
                    var bInRange = oCreatedDate >= oDateFrom && oCreatedDate <= oDateTo;
                    
                    return bInRange;
                };
                
                aFilters.push(new Filter({
                    path: "createdAt",
                    test: fnDateTest
                }));
            }

            // ===== 2. TAB FILTER =====
            switch (sTab) {
                case "new":
                    aFilters.push(new Filter({
                        filters: [
                            new Filter("status", FilterOperator.EQ, "SUBMITTED"),
                            new Filter("status", FilterOperator.EQ, "IN REVIEW")
                        ],
                        and: false // OR condition
                    }));
                    break;
                    
                case "mine":
                    aFilters.push(new Filter("assignee/ID", FilterOperator.EQ, "U999"));
                    break;
                    
                case "overdue":
                    aFilters.push(new Filter("slaStatus", FilterOperator.EQ, "BREACHED"));
                    break;
                    
                case "all":
                    // No additional filter for "all"
                    break;
                    
                default:
                    console.warn("Unknown tab:", sTab);
            }

            // ===== 3. SEARCH FILTER =====
            if (sSearchQuery && sSearchQuery.trim() !== "") {
                var sQuery = sSearchQuery.trim();
                aFilters.push(new Filter({
                    filters: [
                        new Filter("caseID", FilterOperator.Contains, sQuery),
                        new Filter("category", FilterOperator.Contains, sQuery),
                        new Filter("discrepancy/discrepancyID", FilterOperator.Contains, sQuery),
                        new Filter("status", FilterOperator.Contains, sQuery)
                    ],
                    and: false // OR condition
                }));
            }

            // ===== APPLY COMBINED FILTERS =====
            if (aFilters.length > 0) {
                var oCombinedFilter = new Filter({
                    filters: aFilters,
                    and: true // AND condition between date, tab, and search
                });
                
                oBinding.filter(oCombinedFilter);
                console.log(`Applied ${aFilters.length} filters`);
            } else {
                oBinding.filter([]);
                console.log("No filters applied - showing all data");
            }
            
            // ===== UPDATE COUNTS =====
            // Use setTimeout to ensure binding is updated
            setTimeout(() => {
                this._updateCountsFromFilteredData();
            }, 50);
        },

        /**
         * Update counts based on currently filtered/visible data
         * @private
         */
        _updateCountsFromFilteredData: function() {
            const oTable = this.byId("caseList");
            if (!oTable) return;

            const oBinding = oTable.getBinding("items");
            if (!oBinding) return;

            var oViewModel = this.getView().getModel("viewModel");
            var aContexts = oBinding.getContexts();
            
            if (!aContexts || aContexts.length === 0) {
                console.log("No items after filtering");
                oViewModel.setProperty("/counts", { new: 0, mine: 0, overdue: 0, all: 0 });
                oViewModel.setProperty("/kanban", { submitted: 0, inReview: 0, needInfo: 0, readyToClose: 0 });
                return;
            }

            // Get all filtered cases
            var aCases = aContexts.map(ctx => ctx.getObject());
            console.log(`Updating counts for ${aCases.length} filtered cases`);
            
            // Calculate counts
            var iNew = aCases.filter(c => c.status === "SUBMITTED" || c.status === "IN REVIEW").length;
            var iMine = aCases.filter(c => c.assignee && c.assignee.ID === "U999").length;
            var iOverdue = aCases.filter(c => c.slaStatus === "BREACHED").length;
            var iAll = aCases.length;

            // Update tab counts
            oViewModel.setProperty("/counts", {
                new: iNew,
                mine: iMine,
                overdue: iOverdue,
                all: iAll
            });

            // Update Kanban counts
            var iSubmitted = aCases.filter(c => c.status === "SUBMITTED").length;
            var iInReview = aCases.filter(c => c.status === "IN REVIEW").length;
            var iNeedInfo = aCases.filter(c => c.status === "NEED INFO").length;
            var iReadyToClose = aCases.filter(c => c.status === "READY TO CLOSE").length;

            oViewModel.setProperty("/kanban", {
                submitted: iSubmitted,
                inReview: iInReview,
                needInfo: iNeedInfo,
                readyToClose: iReadyToClose
            });

            console.log("Counts updated:", { new: iNew, mine: iMine, overdue: iOverdue, all: iAll });
        },

        /**
         * Clean up on exit
         */
        onExit: function () {
            if (this._autoRefreshInterval) {
                clearInterval(this._autoRefreshInterval);
                this._autoRefreshInterval = null;
            }
        },

        /* ========================================================================
         * EVENT HANDLERS
         * ======================================================================== */

        /**
         * Tab selection handler
         */
        onTabSelect: function (oEvent) {
            const sKey = oEvent.getParameter("key");
            const oViewModel = this.getView().getModel("viewModel");
            oViewModel.setProperty("/selectedTab", sKey);

            // Apply all filters with new tab
            this.applyAllFilters();
            
            MessageToast.show(`Switched to: ${sKey.toUpperCase()} cases`);
        },

        /**
         * Toggle view mode (table/kanban)
         */
        onToggleViewMode: function (oEvent) {
            const sMode = oEvent.getParameter("selectedKey");
            const oViewModel = this.getView().getModel("viewModel");
            oViewModel.setProperty("/viewMode", sMode);
            
            MessageToast.show(`View mode: ${sMode.toUpperCase()}`);
        },

        /**
         * Search handler
         */
        onSearch: function (oEvent) {
            // Apply all filters including search
            this.applyAllFilters();
        },

        /**
         * Selection change handler
         */
        onSelectionChange: function (oEvent) {
            const oTable = oEvent.getSource();
            const aSelectedItems = oTable.getSelectedItems();
            const oViewModel = this.getView().getModel("viewModel");
            oViewModel.setProperty("/selectedItems", aSelectedItems.length);
        },

        // ADD THIS TO YOUR EXISTING View2 controller.js FILE

/**
 * Case press handler - Now disabled, use Actions menu instead
 */
onCasePress: function (oEvent) {
    // Optional: Show a message to guide users
    MessageToast.show("Use the Actions menu (⋮) to view case details");
    
    // Or completely disable by doing nothing:
    // return;
},

/**
 * Actions menu - Show action sheet with multiple options
 */
onShowActions: function(oEvent) {
    const oButton = oEvent.getSource();
    const oContext = oButton.getBindingContext();
    
    if (!oContext) {
        MessageToast.show("No case data available");
        return;
    }
    
    const oCaseData = oContext.getObject();
    
    // ALWAYS destroy and recreate the action sheet to ensure fresh data
    if (this._actionSheet) {
        this._actionSheet.destroy();
        this._actionSheet = null;
    }

    // Create NEW action sheet with current case data
    this._actionSheet = new sap.m.ActionSheet({
        title: "Case Actions - " + oCaseData.caseID,
        showCancelButton: true,
        buttons: [
            new sap.m.Button({
                text: "View Details",
                icon: "sap-icon://detail-view",
                press: () => this._onViewDetails(oCaseData)
            }),
            new sap.m.Button({
                text: "Assign to Me",
                icon: "sap-icon://person-placeholder",
                press: () => this._onQuickAssign(oCaseData)
            }),
            new sap.m.Button({
                text: "Change Priority",
                icon: "sap-icon://flag",
                press: () => this._onChangePriority(oCaseData)
            }),
            new sap.m.Button({
                text: "Request Info",
                icon: "sap-icon://email",
                press: () => this._onQuickRequestInfo(oCaseData)
            }),
            new sap.m.Button({
                text: "Mark as Resolved",
                icon: "sap-icon://accept",
                type: "Accept",
                press: () => this._onQuickResolve(oCaseData)
            }),
            new sap.m.Button({
                text: "Reject Case",
                icon: "sap-icon://decline",
                type: "Reject",
                press: () => this._onQuickReject(oCaseData)
            }),
            new sap.m.Button({
                text: "Download Report",
                icon: "sap-icon://download",
                press: () => this._onDownloadReport(oCaseData)
            })
        ],
        afterClose: () => {
            // Clean up after closing
            if (this._actionSheet) {
                this._actionSheet.destroy();
                this._actionSheet = null;
            }
        }
    });

    this._actionSheet.openBy(oButton);
},

// ==================== ACTION SHEET HANDLERS ====================
/*
_onViewDetails: function(oCaseData) {
    localStorage.setItem("selectedCaseID", oCaseData.caseID);
    MessageToast.show("Opening case: " + oCaseData.caseID);
    window.open("View3.html", "_blank");
},
*/
_onViewDetails: function(oCaseData) {
    localStorage.setItem("selectedCaseID", oCaseData.caseID);
    localStorage.setItem("selectedCaseData", JSON.stringify(oCaseData));
    
    // Navigate using UI5 router
    this.getOwnerComponent().getRouter().navTo("caseDetail", {
        caseId: oCaseData.caseID
    });
    
    MessageToast.show("Opening case details: " + oCaseData.caseID);
    
},

_onQuickAssign: function(oCaseData) {
    MessageBox.confirm(
        `Assign case ${oCaseData.caseID} to yourself?`,
        {
            title: "Confirm Assignment",
            onClose: (sAction) => {
                if (sAction === MessageBox.Action.OK) {
                    // Update case in data model
                    const oModel = this.getView().getModel();
                    const aCases = oModel.getProperty("/DisputeCases");
                    const oCase = aCases.find(c => c.caseID === oCaseData.caseID);
                    
                    if (oCase) {
                        oCase.assignee = {
                            ID: "U999",
                            firstName: "You",
                            lastName: "",
                            workload: 5
                        };
                        oCase.status = "IN_REVIEW";
                        oCase.modifiedAt = new Date().toISOString();
                        oCase.modifiedBy = { firstName: "You", lastName: "" };
                        
                        oModel.setProperty("/DisputeCases", aCases);
                        
                        // Refresh counts
                        this._updateCountsFromFilteredData();
                        
                        MessageToast.show(`✓ Case ${oCaseData.caseID} assigned to you`);
                    }
                }
            }
        }
    );
},

_onChangePriority: function(oCaseData) {
    const aPriorities = [
        { key: "HIGH", text: "High Priority" },
        { key: "MEDIUM", text: "Medium Priority" },
        { key: "LOW", text: "Low Priority" }
    ];

    // Create dialog if not exists
    if (!this._priorityDialog) {
        this._priorityDialog = new sap.m.Dialog({
            title: "Change Priority",
            content: [
                new sap.m.Select({
                    id: "prioritySelect",
                    items: aPriorities.map(p => new sap.m.Item({ key: p.key, text: p.text }))
                })
            ],
            beginButton: new sap.m.Button({
                text: "Save",
                type: "Emphasized",
                press: () => {
                    const sNewPriority = sap.ui.getCore().byId("prioritySelect").getSelectedKey();
                    
                    // Update case
                    const oModel = this.getView().getModel();
                    const aCases = oModel.getProperty("/DisputeCases");
                    const oCase = aCases.find(c => c.caseID === oCaseData.caseID);
                    
                    if (oCase) {
                        oCase.priority = sNewPriority;
                        oCase.modifiedAt = new Date().toISOString();
                        oModel.setProperty("/DisputeCases", aCases);
                        
                        MessageToast.show(`✓ Priority changed to ${sNewPriority}`);
                    }
                    
                    this._priorityDialog.close();
                }
            }),
            endButton: new sap.m.Button({
                text: "Cancel",
                press: () => this._priorityDialog.close()
            })
        });
    }

    // Set current priority
    sap.ui.getCore().byId("prioritySelect").setSelectedKey(oCaseData.priority);
    this._priorityDialog.open();
},



_onQuickRequestInfo: function(oCaseData) {
    MessageBox.confirm(
        `Request additional information for case ${oCaseData.caseID}?`,
        {
            title: "Request Information",
            onClose: (sAction) => {
                if (sAction === MessageBox.Action.OK) {
                    const oModel = this.getView().getModel();
                    const aCases = oModel.getProperty("/DisputeCases");
                    const oCase = aCases.find(c => c.caseID === oCaseData.caseID);
                    
                    if (oCase) {
                        oCase.status = "NEED_INFO";
                        oCase.modifiedAt = new Date().toISOString();
                        oModel.setProperty("/DisputeCases", aCases);
                        
                        this.applyAllFilters();
                        MessageToast.show(`✓ Info requested for ${oCaseData.caseID}`);
                    }
                }
            }
        }
    );
},

_onQuickResolve: function(oCaseData) {
    MessageBox.confirm(
        `Mark case ${oCaseData.caseID} as resolved?`,
        {
            title: "Resolve Case",
            onClose: (sAction) => {
                if (sAction === MessageBox.Action.OK) {
                    const oModel = this.getView().getModel();
                    const aCases = oModel.getProperty("/DisputeCases");
                    const oCase = aCases.find(c => c.caseID === oCaseData.caseID);
                    
                    if (oCase) {
                        oCase.status = "READY_TO_CLOSE";
                        oCase.slaStatus = "ON_TRACK";
                        oCase.modifiedAt = new Date().toISOString();
                        oModel.setProperty("/DisputeCases", aCases);
                        
                        this.applyAllFilters();
                        MessageToast.show(`✓ Case ${oCaseData.caseID} marked as resolved`);
                    }
                }
            }
        }
    );
},

_onQuickReject: function(oCaseData) {
    MessageBox.warning(
        `Reject case ${oCaseData.caseID}?`,
        {
            title: "Reject Case",
            onClose: (sAction) => {
                if (sAction === MessageBox.Action.OK) {
                    const oModel = this.getView().getModel();
                    const aCases = oModel.getProperty("/DisputeCases");
                    const oCase = aCases.find(c => c.caseID === oCaseData.caseID);
                    
                    if (oCase) {
                        oCase.status = "REJECTED";
                        oCase.modifiedAt = new Date().toISOString();
                        oModel.setProperty("/DisputeCases", aCases);
                        
                        this.applyAllFilters();
                        MessageToast.show(`✓ Case ${oCaseData.caseID} rejected`);
                    }
                }
            }
        }
    );
},

_onViewHistory: function(oCaseData) {
    MessageToast.show(`Viewing history for case ${oCaseData.caseID}. Open full details for complete activity log.`);
},

_onDownloadReport: function(oCaseData) {
    MessageToast.show(`Downloading report for case ${oCaseData.caseID}...`);
    // In production, generate and download PDF/Excel report
},

        /**
         * Filter dialog
         */
        onFilterPress: function () {
            MessageToast.show("Advanced filters - To be implemented");
        },

        /**
         * Export to Excel
         */
        onExport: function () {
            const oTable = this.byId("caseList");
            const aItems = oTable.getItems();
            
            MessageToast.show(`Exporting ${aItems.length} cases - To be implemented`);
        },

        /**
         * Bulk assign
         */
        onBulkAssign: function () {
            const oTable = this.byId("caseList");
            const aSelectedItems = oTable.getSelectedItems();

            if (aSelectedItems.length === 0) {
                MessageBox.warning("Please select at least one case to assign");
                return;
            }

            MessageToast.show(`Bulk assign ${aSelectedItems.length} case(s) - To be implemented`);
        },

        /**
         * Refresh button
         */
        onRefresh: function () {
            this.onRefreshData();
        },

        /**
         * Sort dialog
         */
        onSort: function () {
            MessageToast.show("Sort options - To be implemented");
        },

        /**
         * Settings
         */
        onSettings: function () {
            MessageToast.show("Settings - To be implemented");
        },
        /**
 * Toggle header expansion
 */
onToggleHeader: function() {
    const oPage = this.byId("dynamicPageId");
    const bHeaderExpanded = oPage.getHeaderExpanded();
    oPage.setHeaderExpanded(!bHeaderExpanded);
},
        
    });
});
