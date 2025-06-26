"use strict";

if (typeof (ContactForm) === "undefined" || ContactForm === null) {
    var ContactForm = {};
}

if (typeof (ContactForm.Contact) === "undefined") {
    ContactForm.Contact = {};
}

ContactForm.Contact = {
    

    // Called on form OnSave
    formOnSave: function (executionContext) {
        try {
            var formContext = executionContext.getFormContext();
            var email = formContext.getAttribute("emailaddress1")?.getValue();
            var phone = formContext.getAttribute("telephone1")?.getValue();

            if (!email && !phone) {
                executionContext.getEventArgs().preventDefault();

                formContext.ui.setFormNotification(
                    "At least Email or Phone must be filled.",
                    "ERROR",
                    "mandatoryFields"
                );
            } else {
                formContext.ui.clearFormNotification("mandatoryFields");
            }

        } catch (e) {
            Xrm.Utility.alertDialog("Form Save Error: " + e.message);
        }
    },

    // Handles Preferred Method change and sets required fields
    onChangePreferredMethodOfContact: function (executionContext) {
        try {
            var formContext = executionContext.getFormContext();
            var preferredMethod = formContext.getAttribute("preferredcontactmethodcode")?.getValue();
            var emailAttr = formContext.getAttribute("emailaddress1");
            var phoneAttr = formContext.getAttribute("telephone1");

            if (emailAttr) emailAttr.setRequiredLevel("none");
            if (phoneAttr) phoneAttr.setRequiredLevel("none");

            if (preferredMethod === 2 && emailAttr) { // Email
                emailAttr.setRequiredLevel("required");
            } else if (preferredMethod === 3 && phoneAttr) { // Phone
                phoneAttr.setRequiredLevel("required");
            }

        } catch (e) {
            Xrm.Utility.alertDialog("Field Change Error: " + e.message);
        }
    }
};
if (typeof module !== "undefined" && module.exports) {
    module.exports = ContactForm;
}
