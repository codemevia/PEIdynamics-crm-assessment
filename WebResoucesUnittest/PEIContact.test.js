const XrmMock = require("xrm-mock");
global.Xrm = XrmMock.XrmMockGenerator.initialise();

const ContactForm = require("../WebResources/PEIContact.js");

describe("ContactForm JavaScript Tests", () => {
    let formContext, executionContext, preventSaveMock;

    beforeEach(() => {
        XrmMock.XrmMockGenerator.initialise();

        preventSaveMock = jest.fn();

        // Mock form context
        formContext = {
            getAttribute: jest.fn(),
            ui: {
                setFormNotification: jest.fn(),
                clearFormNotification: jest.fn()
            }
        };

        // Mock execution context
        executionContext = {
            getFormContext: () => formContext,
            getEventArgs: () => ({
                preventDefault: preventSaveMock
            })
        };
    });

    describe("formOnSave", () => {
        test("Should prevent save and show error if email and phone are both empty", () => {
            formContext.getAttribute.mockImplementation(() => ({
                getValue: () => null
            }));

            ContactForm.Contact.formOnSave(executionContext);

            expect(preventSaveMock).toHaveBeenCalled();
            expect(formContext.ui.setFormNotification).toHaveBeenCalledWith(
                "At least Email or Phone must be filled.",
                "ERROR",
                "mandatoryFields"
            );
        });

        test("Should clear error if email or phone is filled", () => {
            formContext.getAttribute.mockImplementation((name) => ({
                getValue: () => (name === "emailaddress1" ? "test@example.com" : null)
            }));

            ContactForm.Contact.formOnSave(executionContext);

            expect(formContext.ui.clearFormNotification).toHaveBeenCalledWith("mandatoryFields");
        });
    });

    describe("onChangePreferredMethodOfContact", () => {
        let emailAttrMock, phoneAttrMock;

        beforeEach(() => {
            emailAttrMock = { setRequiredLevel: jest.fn() };
            phoneAttrMock = { setRequiredLevel: jest.fn() };
        });

        test("Should set email as required if preferred method is Email", () => {
            formContext.getAttribute.mockImplementation((name) => {
                if (name === "preferredcontactmethodcode") return { getValue: () => 2 };
                if (name === "emailaddress1") return emailAttrMock;
                if (name === "telephone1") return phoneAttrMock;
                return null;
            });

            ContactForm.Contact.onChangePreferredMethodOfContact(executionContext);

            expect(emailAttrMock.setRequiredLevel).toHaveBeenCalledWith("required");
            expect(phoneAttrMock.setRequiredLevel).toHaveBeenCalledWith("none");
        });

        test("Should set phone as required if preferred method is Phone", () => {
            formContext.getAttribute.mockImplementation((name) => {
                if (name === "preferredcontactmethodcode") return { getValue: () => 3 };
                if (name === "emailaddress1") return emailAttrMock;
                if (name === "telephone1") return phoneAttrMock;
                return null;
            });

            ContactForm.Contact.onChangePreferredMethodOfContact(executionContext);

            expect(phoneAttrMock.setRequiredLevel).toHaveBeenCalledWith("required");
            expect(emailAttrMock.setRequiredLevel).toHaveBeenCalledWith("none");
        });

        test("Should set both email and phone to none if no method selected", () => {
            formContext.getAttribute.mockImplementation((name) => {
                if (name === "preferredcontactmethodcode") return { getValue: () => null };
                if (name === "emailaddress1") return emailAttrMock;
                if (name === "telephone1") return phoneAttrMock;
                return null;
            });

            ContactForm.Contact.onChangePreferredMethodOfContact(executionContext);

            expect(emailAttrMock.setRequiredLevel).toHaveBeenCalledWith("none");
            expect(phoneAttrMock.setRequiredLevel).toHaveBeenCalledWith("none");
        });
    });
});
