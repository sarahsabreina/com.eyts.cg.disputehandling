sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History"
], function (
    Controller,
    JSONModel,
    MessageToast,
    MessageBox,
    History
) {
    "use strict";

    return Controller.extend("project2.controller.View3", {

        formatter: {
            formatRecurring: function(isRecurring) {
                return isRecurring ? "🔁 Recurring" : "";
            },
            
            statusState: function(status) {
                const states = {
                    "SUBMITTED": "Warning",
                    "IN_REVIEW": "Information",
                    "NEED_INFO": "Warning",
                    "RESOLVED": "Success",
                    "REJECTED": "Error",
                    "READY_TO_CLOSE": "Success",
                    "CLOSED": "None"
                };
                return states[status] || "None";
            },
            
            slaState: function(slaStatus) {
                const states = {
                    "ON_TRACK": "Success",
                    "AT_RISK": "Warning",
                    "BREACHED": "Error"
                };
                return states[slaStatus] || "None";
            },
            
            slaPercentage: function(remainingHours) {
                if (!remainingHours) return 0;
                const totalHours = 120;
                return Math.min(100, Math.max(0, (remainingHours / totalHours) * 100));
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
            
            formatDateTime: function(date) {
                if (!date) return "-";
                const d = new Date(date);
                return d.toLocaleString();
            },
            
            formatDate: function(date) {
                if (!date) return "-";
                const d = new Date(date);
                return d.toLocaleDateString();
            },
            
            formatBoolean: function(value) {
                return value ? "Yes" : "No";
            },
            
            isNotAssignedToMe: function(assigneeID) {
                return assigneeID !== "U999";
            }
        },

        onInit: function () {
            // Attach route matched event
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("caseDetail").attachPatternMatched(this._onRouteMatched, this);
        },

        /**
         * Route matched handler - loads case data
         */
        _onRouteMatched: function(oEvent) {
            const sCaseID = oEvent.getParameter("arguments").caseId;
            
            if (!sCaseID) {
                MessageBox.error("No case ID provided");
                this.onNavBack();
                return;
            }
            
            // Show loading indicator
            sap.ui.core.BusyIndicator.show(0);
            
            // Simulate API delay
            setTimeout(() => {
                this._loadCaseDetails(sCaseID);
                sap.ui.core.BusyIndicator.hide();
            }, 300);
        },

        /**
         * Load case details from localStorage or generate mock data
         */
        _loadCaseDetails: function(sCaseID) {
            let caseData;
            
            // Try to get from localStorage first
            const storedData = localStorage.getItem("selectedCaseData");
            
            if (storedData) {
                try {
                    caseData = JSON.parse(storedData);
                    console.log("Loaded case from localStorage:", sCaseID);
                } catch (e) {
                    console.error("Failed to parse stored case data:", e);
                    caseData = this._getMockCaseDetails(sCaseID);
                }
            } else {
                // Generate mock data
                caseData = this._getMockCaseDetails(sCaseID);
                console.log("Generated mock case data:", sCaseID);
            }
            
            // Enhance with detailed information
            caseData = this._enhanceCaseData(caseData);
            
            // Set model
            const oModel = new JSONModel(caseData);
            this.getView().setModel(oModel);
            
            MessageToast.show("Case " + sCaseID + " loaded successfully");
        },

        /**
         * Enhance case data with additional details, solution, and activities
         */
        _enhanceCaseData: function(caseData) {
            // Add discrepancy details if missing
            if (!caseData.discrepancy) {
                caseData.discrepancy = {
                    discrepancyID: caseData.discrepancy?.discrepancyID || "D" + caseData.caseID.substring(1),
                    type: caseData.category,
                    sourceSystem: "SAP ERP",
                    transactionDate: this._formatDate(new Date(caseData.createdAt)),
                    documentNumber: "DOC-2026-" + Math.floor(Math.random() * 10000).toString().padStart(5, '0'),
                    referenceNumber: "REF-" + caseData.caseID,
                    glAccount: "400000 - Revenue",
                    costCenter: "CC-1200",
                    expectedAmount: caseData.impactAmount,
                    actualAmount: caseData.impactAmount + (caseData.impactVariance || 0),
                    description: `${caseData.category} detected in financial reconciliation. Requires investigation and resolution.`
                };
            }
            
            // Add solution if missing
            if (!caseData.solution && caseData.category) {
                caseData.solution = this._generateSolution(caseData);
            }
            
            // Add root cause if missing
            if (!caseData.rootCause) {
                caseData.rootCause = {
                    primary: "System integration issue between billing and accounting systems",
                    factors: [
                        { factor: "Data synchronization delay" },
                        { factor: "Missing validation rules" },
                        { factor: "Manual entry error" }
                    ],
                    prevention: "Implement automated validation checks and real-time alerts for discrepancies."
                };
            }
            
            // Add activities if missing
            if (!caseData.activities || caseData.activities.length === 0) {
                caseData.activities = [
                    {
                        actor: `${caseData.submitter.firstName} ${caseData.submitter.lastName}`,
                        action: "Created Case",
                        timestamp: caseData.createdAt,
                        comment: "Discrepancy identified during reconciliation process."
                    }
                ];
                
                if (caseData.assignee) {
                    caseData.activities.push({
                        actor: `${caseData.assignee.firstName} ${caseData.assignee.lastName}`,
                        action: "Assigned",
                        timestamp: caseData.modifiedAt,
                        comment: "Case assigned for review and resolution."
                    });
                }
            }
            
            // Add comments if missing
            if (!caseData.comments) {
                caseData.comments = [];
            }
            
            // Add attachments if missing
            if (!caseData.attachments) {
                caseData.attachments = [
                    {
                        fileName: "Supporting_Document.pdf",
                        mimeType: "application/pdf",
                        url: "#",
                        uploadedDate: caseData.createdAt
                    }
                ];
            }
            
            return caseData;
        },

        /**
         * Generate solution based on case category
         */
        _generateSolution: function(caseData) {
            const solutions = {
                "Missing Entry": {
                    type: "Manual Journal Entry",
                    estimatedTime: "2-4 hours",
                    approvalRequired: true,
                    description: "Create manual journal entry to record the missing transaction.",
                    steps: [
                        { step: "Verify original transaction details" },
                        { step: "Prepare correcting journal entry" },
                        { step: "Obtain required approvals" },
                        { step: "Post entry in accounting system" },
                        { step: "Reconcile affected accounts" }
                    ],
                    impact: "Will correct the accounting records and align with actual transactions."
                },
                "Amount Mismatch": {
                    type: "Adjustment Entry",
                    estimatedTime: "1-3 hours",
                    approvalRequired: true,
                    description: "Post adjustment entry to correct the amount variance.",
                    steps: [
                        { step: "Identify source of discrepancy" },
                        { step: "Calculate adjustment amount" },
                        { step: "Prepare adjustment entry" },
                        { step: "Get approval from finance manager" },
                        { step: "Post adjustment" }
                    ],
                    impact: "Will ensure accurate financial reporting."
                },
                "Duplicate Entry": {
                    type: "Reversal Entry",
                    estimatedTime: "1-2 hours",
                    approvalRequired: false,
                    description: "Create reversal entry to remove duplicate transaction.",
                    steps: [
                        { step: "Confirm duplicate transaction" },
                        { step: "Prepare reversal entry" },
                        { step: "Post reversal in system" },
                        { step: "Verify account balances" }
                    ],
                    impact: "Will remove duplicate entry and correct account balances."
                },
                "Amount Variance": {
                    type: "Variance Analysis",
                    estimatedTime: "2-5 hours",
                    approvalRequired: false,
                    description: "Investigate and resolve amount variance.",
                    steps: [
                        { step: "Compare source documents" },
                        { step: "Contact relevant parties for clarification" },
                        { step: "Document findings" },
                        { step: "Post correcting entry if needed" }
                    ],
                    impact: "Will clarify the variance and take appropriate action."
                }
            };
            
            return solutions[caseData.category] || solutions["Amount Variance"];
        },

        /**
         * Format date helper
         */
        _formatDate: function(date) {
            const d = new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        },

        /**
         * Get mock case details (fallback)
         */
        _getMockCaseDetails: function(caseID) {
            // Your existing _getMockCaseDetails implementation
            const cases = {
                "C110": {
                    caseID: "C110",
                    category: "Missing Entry",
                    status: "SUBMITTED",
                    priority: "HIGH",
                    impactAmount: 120000,
                    impactVariance: -120000,
                    slaRemainingHours: 24,
                    slaStatus: "ON_TRACK",
                    isRecurring: true,
                    createdAt: new Date().toISOString(),
                    modifiedAt: new Date().toISOString(),
                    submitter: {
                        ID: "U001",
                        firstName: "John",
                        lastName: "Smith",
                        email: "john.smith@company.com"
                    },
                    assignee: null,
                    modifiedBy: {
                        firstName: "John",
                        lastName: "Smith"
                    }
                }
                // Add other case templates as needed
            };
            
            // Return matched case or generate generic one
            if (cases[caseID]) {
                return cases[caseID];
            }
            
            // Generate generic case
            return {
                caseID: caseID,
                category: "Amount Variance",
                status: "SUBMITTED",
                priority: "MEDIUM",
                impactAmount: 50000,
                impactVariance: 0,
                slaRemainingHours: 48,
                slaStatus: "ON_TRACK",
                isRecurring: false,
                createdAt: new Date().toISOString(),
                modifiedAt: new Date().toISOString(),
                submitter: {
                    ID: "U001",
                    firstName: "John",
                    lastName: "Smith",
                    email: "john.smith@company.com"
                },
                assignee: null,
                modifiedBy: {
                    firstName: "System",
                    lastName: ""
                }
            };
        },

        /**
         * Navigate back to dispute queue
         */
        onNavBack: function() {
            // Clear stored data
            localStorage.removeItem("selectedCaseID");
            localStorage.removeItem("selectedCaseData");
            
            const oHistory = History.getInstance();
            const sPreviousHash = oHistory.getPreviousHash();
            
            
if (sPreviousHash !== undefined) {
    window.history.go(-1);
} else {
    const oRouter = this.getOwnerComponent().getRouter();
    oRouter.navTo("RouteView2", {}, true);
}

        },

        // Keep all your existing action handlers (onAssignToMe, onRequestInfo, etc.)
        onAssignToMe: function() {
            const oModel = this.getView().getModel();
            const currentAssignee = oModel.getProperty("/assignee");
            
            if (currentAssignee && currentAssignee.ID === "U999") {
                MessageToast.show("Case already assigned to you");
                return;
            }
            
            MessageBox.confirm(
                "Assign this case to yourself?",
                {
                    title: "Confirm Assignment",
                    onClose: (sAction) => {
                        if (sAction === MessageBox.Action.OK) {
                            oModel.setProperty("/assignee", {
                                ID: "U999",
                                firstName: "You",
                                lastName: "",
                                workload: 6
                            });
                            
                            oModel.setProperty("/status", "IN_REVIEW");
                            
                            const activities = oModel.getProperty("/activities");
                            activities.push({
                                actor: "You",
                                action: "Assigned to Self",
                                timestamp: new Date().toISOString(),
                                comment: "Taking ownership of this case"
                            });
                            oModel.setProperty("/activities", activities);
                            
                            MessageToast.show("✓ Case assigned to you");
                        }
                    }
                }
            );
        },

        onRequestInfo: function() {
            MessageBox.information(
                "Request additional information from submitter?",
                {
                    title: "Request Information",
                    onClose: (sAction) => {
                        if (sAction === MessageBox.Action.OK) {
                            const oModel = this.getView().getModel();
                            oModel.setProperty("/status", "NEED_INFO");
                            
                            const activities = oModel.getProperty("/activities");
                            activities.push({
                                actor: "You",
                                action: "Requested Information",
                                timestamp: new Date().toISOString(),
                                comment: "Requested additional supporting documents"
                            });
                            oModel.setProperty("/activities", activities);
                            
                            MessageToast.show("✓ Information requested from submitter");
                        }
                    }
                }
            );
        },

        onResolve: function() {
            MessageBox.confirm(
                "Mark this case as resolved? This action will complete the case workflow.",
                {
                    title: "Resolve Case",
                    onClose: (sAction) => {
                        if (sAction === MessageBox.Action.OK) {
                            const oModel = this.getView().getModel();
                            oModel.setProperty("/status", "READY_TO_CLOSE");
                            oModel.setProperty("/slaStatus", "ON_TRACK");
                            
                            const activities = oModel.getProperty("/activities");
                            activities.push({
                                actor: "You",
                                action: "Resolved Case",
                                timestamp: new Date().toISOString(),
                                comment: "Case resolved successfully. Ready for closure."
                            });
                            oModel.setProperty("/activities", activities);
                            
                            MessageToast.show("✓ Case marked as resolved");
                        }
                    }
                }
            );
        },

        onReject: function() {
            MessageBox.warning(
                "Reject this case? Please provide a reason.",
                {
                    title: "Reject Case",
                    onClose: (sAction) => {
                        if (sAction === MessageBox.Action.OK) {
                            const oModel = this.getView().getModel();
                            oModel.setProperty("/status", "REJECTED");
                            
                            const activities = oModel.getProperty("/activities");
                            activities.push({
                                actor: "You",
                                action: "Rejected Case",
                                timestamp: new Date().toISOString(),
                                comment: "Case rejected - insufficient information provided"
                            });
                            oModel.setProperty("/activities", activities);
                            
                            MessageToast.show("✓ Case rejected");
                        }
                    }
                }
            );
        },

        onPostComment: function(oEvent) {
            const sValue = oEvent.getParameter("value");
            
            if (!sValue || sValue.trim() === "") {
                MessageToast.show("Please enter a comment");
                return;
            }
            
            const oModel = this.getView().getModel();
            const comments = oModel.getProperty("/comments");
            
            comments.push({
                author: "You",
                timestamp: new Date().toISOString(),
                text: sValue
            });
            
            oModel.setProperty("/comments", comments);
            
            const activities = oModel.getProperty("/activities");
            activities.push({
                actor: "You",
                action: "Added Comment",
                timestamp: new Date().toISOString(),
                comment: sValue
            });
            oModel.setProperty("/activities", activities);
            
            MessageToast.show("✓ Comment added");
        }
    });
});