using System;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Microsoft.Xrm.Sdk;
using FakeXrmEasy;
using PEICustomPlugins;

namespace PEICustomPlugins.Tests
{
    [TestClass]
    public class CreateChildContactOnAccountCreateTests
    {
        private XrmFakedContext _context;

        [TestInitialize]
        public void Setup()
        {
            _context = new XrmFakedContext();
        }

        [TestMethod]
        public void Should_Create_Contact_When_Valid_Account_Is_Created()
        {
            // Arrange
            var newAccount = new Entity("account")
            {
                Id = Guid.NewGuid(),
                ["name"] = "Contoso"
            };

            var pluginContext = _context.GetDefaultPluginContext();
            pluginContext.MessageName = "Create";
            pluginContext.PrimaryEntityName = "account";
            pluginContext.InputParameters["Target"] = newAccount;
            pluginContext.OutputParameters["id"] = newAccount.Id;

            // Act
            _context.ExecutePluginWith<CreateChildContactOnAccountCreate>(pluginContext);

            // Assert
            var contacts = _context.CreateQuery("contact").ToList();
            Assert.AreEqual(1, contacts.Count);
            Assert.AreEqual("Contoso", contacts[0]["lastname"]);
            Assert.AreEqual(new EntityReference("account", newAccount.Id), contacts[0]["parentcustomerid"]);
        }

        [TestMethod]
        public void Should_Not_Create_Contact_If_Account_Name_Is_Missing()
        {
            var newAccount = new Entity("account")
            {
                Id = Guid.NewGuid()
                // No 'name'
            };

            var pluginContext = _context.GetDefaultPluginContext();
            pluginContext.MessageName = "Create";
            pluginContext.PrimaryEntityName = "account";
            pluginContext.InputParameters["Target"] = newAccount;
            pluginContext.OutputParameters["id"] = newAccount.Id;

            _context.ExecutePluginWith<CreateChildContactOnAccountCreate>(pluginContext);

            var contacts = _context.CreateQuery("contact").ToList();
            Assert.AreEqual(0, contacts.Count);
        }

        [TestMethod]
        public void Should_Not_Create_Contact_If_Account_Id_Is_Missing()
        {
            var newAccount = new Entity("account")
            {
                ["name"] = "NoId Account"
            };

            var pluginContext = _context.GetDefaultPluginContext();
            pluginContext.MessageName = "Create";
            pluginContext.PrimaryEntityName = "account";
            pluginContext.InputParameters["Target"] = newAccount;
            // no OutputParameters["id"]

            _context.ExecutePluginWith<CreateChildContactOnAccountCreate>(pluginContext);

            var contacts = _context.CreateQuery("contact").ToList();
            Assert.AreEqual(0, contacts.Count);
        }

        [TestMethod]
        public void Should_Not_Create_Contact_If_Message_Is_Not_Create()
        {
            var account = new Entity("account")
            {
                Id = Guid.NewGuid(),
                ["name"] = "WrongMessage"
            };

            var pluginContext = _context.GetDefaultPluginContext();
            pluginContext.MessageName = "Update"; // Not "Create"
            pluginContext.PrimaryEntityName = "account";
            pluginContext.InputParameters["Target"] = account;
            pluginContext.OutputParameters["id"] = account.Id;

            _context.ExecutePluginWith<CreateChildContactOnAccountCreate>(pluginContext);

            var contacts = _context.CreateQuery("contact").ToList();
            Assert.AreEqual(0, contacts.Count);
        }

        [TestMethod]
        public void Should_Not_Create_Contact_If_Entity_Is_Not_Account()
        {
            var contact = new Entity("contact")
            {
                Id = Guid.NewGuid(),
                ["firstname"] = "WrongEntity"
            };

            var pluginContext = _context.GetDefaultPluginContext();
            pluginContext.MessageName = "Create";
            pluginContext.PrimaryEntityName = "contact"; // Not "account"
            pluginContext.InputParameters["Target"] = contact;
            pluginContext.OutputParameters["id"] = contact.Id;

            _context.ExecutePluginWith<CreateChildContactOnAccountCreate>(pluginContext);

            var contacts = _context.CreateQuery("contact").ToList();
            Assert.AreEqual(0, contacts.Count);
        }
    }
}
