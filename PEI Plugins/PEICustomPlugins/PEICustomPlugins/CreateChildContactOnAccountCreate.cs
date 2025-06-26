using System;
using Microsoft.Xrm.Sdk;

namespace PEICustomPlugins
{
    public class CreateChildContactOnAccountCreate : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            // get The execution context
            IPluginExecutionContext context =
                (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));

            //get the tracing service
            ITracingService tracer =
                (ITracingService)serviceProvider.GetService(typeof(ITracingService));

            //get the organization service
            IOrganizationServiceFactory serviceFactory =
                (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            IOrganizationService service = serviceFactory.CreateOrganizationService(context.UserId);

            try
            {
                // proceed if the message is Create and the target is an Account entity
                if (context.MessageName != "Create" || context.PrimaryEntityName != "account")
                    return;

                if (!context.InputParameters.TryGetValue("Target", out object targetObj) || !(targetObj is Entity account))
                    return;

                string accountName = account.GetAttributeValue<string>("name");
                if (string.IsNullOrWhiteSpace(accountName))
                {
                    tracer.Trace("Account name is empty. Skipping contact creation.");
                    return;
                }

                // Get the newly created Account ID
                Guid accountId = context.OutputParameters.Contains("id") ?
                    (Guid)context.OutputParameters["id"] : Guid.Empty;

                if (accountId == Guid.Empty)
                {
                    tracer.Trace("Account ID not found. Cannot create related contact.");
                    return;
                }

                // Create a related Contact
                Entity contact = new Entity("contact");
                contact["firstname"] = "Default";
                contact["lastname"] = accountName;
                contact["parentcustomerid"] = new EntityReference("account", accountId);

                service.Create(contact);

                tracer.Trace("Child contact created successfully for account: " + accountName);
            }
            catch (Exception ex)
            {
                tracer.Trace("Exception: " + ex.ToString());
                throw new InvalidPluginExecutionException("An error occurred while creating child contact.", ex);
            }
        }
    }
}
