"use strict";

if (typeof (OpportunityForm) === "undefined" || OpportunityForm === null) {
    var OpportunityForm = {};
}

if (typeof (OpportunityForm.Opportunity) === "undefined") {
    OpportunityForm.Opportunity = {};
}

OpportunityForm.Opportunity = {

    // Called on form load
    formOnLoad: function (executionContext) {
        try {
            var formContext = executionContext.getFormContext();
            OpportunityForm.Opportunity.onChangeOpportunityType(executionContext); // Reuse the same logic
        } catch (e) {
            Xrm.Utility.alertDialog("Form Load Error: " + e.message);
        }
    },

    // Called on change of Opportunity Type
    onChangeOpportunityType: function (executionContext) {
        try {
            var formContext = executionContext.getFormContext();
            var oppType = formContext.getAttribute("pei_opportunitytype")?.getValue();
            var estimatedRevenueCtrl = formContext.getControl("pei_estimatedrevenue");

            // Inline toggle logic
            var fieldNames = ["pei_totalunits", "pei_unitprice", "pei_discountamount"];

            if (oppType === 890920000) { // Fixed Price
                fieldNames.forEach(function (fieldName) {
                    var ctrl = formContext.getControl(fieldName);
                    if (ctrl) ctrl.setVisible(false);
                });
                if (estimatedRevenueCtrl) estimatedRevenueCtrl.setDisabled(true);
            }
            else if (oppType === 890920001) { // Variable Price
                fieldNames.forEach(function (fieldName) {
                    var ctrl = formContext.getControl(fieldName);
                    if (ctrl) ctrl.setVisible(true);
                });
                if (estimatedRevenueCtrl) estimatedRevenueCtrl.setDisabled(false);
            }
            else {
                fieldNames.forEach(function (fieldName) {
                    var ctrl = formContext.getControl(fieldName);
                    if (ctrl) ctrl.setVisible(false);
                });
                if (estimatedRevenueCtrl) estimatedRevenueCtrl.setDisabled(true);
            }

        } catch (e) {
            Xrm.Utility.alertDialog("Opportunity Type Change Error: " + e.message);
        }
    },

    // Called on form save
    onSave: function (executionContext) {
        try {
            var formContext = executionContext.getFormContext();
            var oppType = formContext.getAttribute("pei_opportunitytype")?.getValue();

            if (oppType === 890920001) { // Variable Price
                // Only calculate if Variable
                var totalUnits = formContext.getAttribute("pei_totalunits")?.getValue();
                var unitPrice = formContext.getAttribute("pei_unitprice")?.getValue();
                var discount = formContext.getAttribute("pei_discountamount")?.getValue();

                if (totalUnits == null || unitPrice == null || discount == null) {
                    formContext.ui.setFormNotification("Please enter Total Units, Unit Price, and Discount to calculate Estimated Revenue.", "ERROR", "revenue_calc");
                    executionContext.getEventArgs().preventDefault(); // Stop save
                    return;
                }

                var revenue = (totalUnits * unitPrice) - discount;
                formContext.getAttribute("pei_estimatedrevenue").setValue(revenue);
                formContext.ui.clearFormNotification("revenue_calc");
            }

        } catch (e) {
            Xrm.Utility.alertDialog("Save Error: " + e.message);
        }
    }
};
if (typeof module !== "undefined" && module.exports) {
    module.exports = OpportunityForm;
}
