const XrmMock = require("xrm-mock");
global.Xrm = XrmMock.XrmMockGenerator.initialise();
const OpportunityForm = require("../WebResources/PEIOpportunity.js");

describe("OpportunityForm JavaScript Tests", () => {
    let executionContext, formContext, attributes, controls;

    
    const createMockAttribute = (logicalName, value) => {
        const mock = {
            getValue: jest.fn(() => value),
            setValue: jest.fn()
        };
        attributes[logicalName] = mock;
        return mock;
    };

    const createMockControl = (logicalName) => {
        const mock = {
            setVisible: jest.fn(),
            setDisabled: jest.fn()
        };
        controls[logicalName] = mock;
        return mock;
    };

    beforeEach(() => {
        XrmMock.XrmMockGenerator.initialise();

        attributes = {};
        controls = {};

        formContext = {
            getAttribute: jest.fn((name) => attributes[name] || null),
            getControl: jest.fn((name) => controls[name] || null),
            ui: {
                setFormNotification: jest.fn(),
                clearFormNotification: jest.fn()
            }
        };

        executionContext = {
            getFormContext: () => formContext,
            getEventArgs: () => ({
                preventDefault: jest.fn()
            })
        };
    });
    describe("formOnLoad", () => {
    test("Should call onChangeOpportunityType on form load", () => {
        const executionContext = {
            getFormContext: () => formContext
        };

        // Spy on onChangeOpportunityType
        const onChangeSpy = jest.spyOn(OpportunityForm.Opportunity, "onChangeOpportunityType");

        OpportunityForm.Opportunity.formOnLoad(executionContext);

        expect(onChangeSpy).toHaveBeenCalledWith(executionContext);
    });

    test("Should catch and alert error if exception is thrown", () => {
        const executionContext = {
            getFormContext: () => {
                throw new Error("Mocked Load Error");
            }
        };

        const alertSpy = jest.fn();
        global.Xrm.Utility = {
            alertDialog: alertSpy
        };

        OpportunityForm.Opportunity.formOnLoad(executionContext);

        expect(alertSpy).toHaveBeenCalledWith("Form Load Error: Mocked Load Error");
    });
});


    describe("onChangeOpportunityType", () => {
        test("Should hide fields and disable estimated revenue for Fixed Price", () => {
            createMockAttribute("pei_opportunitytype", 890920000);
            createMockControl("pei_totalunits");
            createMockControl("pei_unitprice");
            createMockControl("pei_discountamount");
            createMockControl("pei_estimatedrevenue");

            OpportunityForm.Opportunity.onChangeOpportunityType(executionContext);

            expect(controls["pei_totalunits"].setVisible).toHaveBeenCalledWith(false);
            expect(controls["pei_unitprice"].setVisible).toHaveBeenCalledWith(false);
            expect(controls["pei_discountamount"].setVisible).toHaveBeenCalledWith(false);
            expect(controls["pei_estimatedrevenue"].setDisabled).toHaveBeenCalledWith(true);
        });

        test("Should show fields and enable estimated revenue for Variable Price", () => {
            createMockAttribute("pei_opportunitytype", 890920001);
            createMockControl("pei_totalunits");
            createMockControl("pei_unitprice");
            createMockControl("pei_discountamount");
            createMockControl("pei_estimatedrevenue");

            OpportunityForm.Opportunity.onChangeOpportunityType(executionContext);

            expect(controls["pei_totalunits"].setVisible).toHaveBeenCalledWith(true);
            expect(controls["pei_unitprice"].setVisible).toHaveBeenCalledWith(true);
            expect(controls["pei_discountamount"].setVisible).toHaveBeenCalledWith(true);
            expect(controls["pei_estimatedrevenue"].setDisabled).toHaveBeenCalledWith(false);
        });

        test("Should hide all fields and disable estimated revenue for other type", () => {
            createMockAttribute("pei_opportunitytype", null);
            createMockControl("pei_totalunits");
            createMockControl("pei_unitprice");
            createMockControl("pei_discountamount");
            createMockControl("pei_estimatedrevenue");

            OpportunityForm.Opportunity.onChangeOpportunityType(executionContext);

            expect(controls["pei_totalunits"].setVisible).toHaveBeenCalledWith(false);
            expect(controls["pei_unitprice"].setVisible).toHaveBeenCalledWith(false);
            expect(controls["pei_discountamount"].setVisible).toHaveBeenCalledWith(false);
            expect(controls["pei_estimatedrevenue"].setDisabled).toHaveBeenCalledWith(true);
        });
    });

    describe("onSave", () => {
        test("Should calculate estimated revenue for Variable Price", () => {
            createMockAttribute("pei_opportunitytype", 890920001);
            createMockAttribute("pei_totalunits", 10);
            createMockAttribute("pei_unitprice", 100);
            createMockAttribute("pei_discountamount", 50);
            const estRevenue = createMockAttribute("pei_estimatedrevenue", null);

            OpportunityForm.Opportunity.onSave(executionContext);

            expect(estRevenue.setValue).toHaveBeenCalledWith(950);
            expect(formContext.ui.clearFormNotification).toHaveBeenCalledWith("revenue_calc");
        });

        test("Should show notification and prevent save if values are missing", () => {
    createMockAttribute("pei_opportunitytype", 890920001);
    createMockAttribute("pei_totalunits", null);
    createMockAttribute("pei_unitprice", null);
    createMockAttribute("pei_discountamount", null);
    createMockAttribute("pei_estimatedrevenue", null);

    const preventDefaultMock = jest.fn();

    // Override getEventArgs to return mocked preventDefault
    executionContext.getEventArgs = () => ({
        preventDefault: preventDefaultMock
    });

    OpportunityForm.Opportunity.onSave(executionContext);

    expect(formContext.ui.setFormNotification).toHaveBeenCalledWith(
        "Please enter Total Units, Unit Price, and Discount to calculate Estimated Revenue.",
        "ERROR",
        "revenue_calc"
    );
    expect(preventDefaultMock).toHaveBeenCalled(); // ✅ This will now pass
});


        test("Should do nothing if Opportunity Type is Fixed", () => {
            createMockAttribute("pei_opportunitytype", 890920000);

            OpportunityForm.Opportunity.onSave(executionContext);

            expect(formContext.ui.setFormNotification).not.toHaveBeenCalled();
            expect(formContext.ui.clearFormNotification).not.toHaveBeenCalled();
        });
    });
});
