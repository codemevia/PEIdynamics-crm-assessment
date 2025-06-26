using System;
using System.Linq;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;

namespace PEICustomPlugins
{
    public class DuplicateEmailCheck : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            // Services
            var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            var tracingService = (ITracingService)serviceProvider.GetService(typeof(ITracingService));
            var serviceFactory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            var service = serviceFactory.CreateOrganizationService(context.UserId);

            tracingService.Trace("DuplicateEmailCheck plugin execution started.");

            // Check if the input contains a Target entity
            if (!(context.InputParameters.Contains("Target") && context.InputParameters["Target"] is Entity targetEntity))
            {
                tracingService.Trace("Target is missing or not an Entity. Exiting.");
                return;
            }

            // Ensure it's the Contact entity
            if (targetEntity.LogicalName != "contact")
            {
                tracingService.Trace("Target is not a Contact entity. Exiting.");
                return;
            }

            // Get the email address from the input entity
            string email = targetEntity.GetAttributeValue<string>("emailaddress1");

            if (string.IsNullOrWhiteSpace(email))
            {
                tracingService.Trace("No email address provided. Skipping duplicate check.");
                return;
            }

            // Normalize email if needed
            email = email.Trim().ToLowerInvariant();
            tracingService.Trace($"Checking for existing contacts with email: {email}");

            // Query to check for existing contacts with the same email
            var query = new QueryExpression("contact")
            {
                ColumnSet = new ColumnSet(false), // No need to retrieve any fields
                Criteria = new FilterExpression
                {
                    Conditions =
                    {
                        new ConditionExpression("emailaddress1", ConditionOperator.Equal, email)
                    }
                },
                TopCount = 1,
                NoLock = true
            };

            var existingContacts = service.RetrieveMultiple(query);

            if (existingContacts.Entities.Any())
            {
                tracingService.Trace("Duplicate contact found. Throwing exception.");
                throw new InvalidPluginExecutionException("A contact with this email address already exists.");
            }

            tracingService.Trace("No duplicate found. Plugin execution complete.");
        }
    }
}
