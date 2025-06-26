using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Microsoft.Xrm.Sdk;
using FakeXrmEasy;
using PEICustomPlugins;
using System.Linq;

namespace PEICustomPlugins.Tests
{
    [TestClass]
    public class DuplicateEmailCheckUnittest
    {
        private XrmFakedContext _context;

        [TestInitialize]
        public void Setup()
        {
            _context = new XrmFakedContext();
        }

        [TestMethod]
        [ExpectedException(typeof(InvalidPluginExecutionException))]
        public void Should_Throw_Exception_When_Duplicate_Email_Exists()
        {
            var existingContact = new Entity("contact")
            {
                Id = Guid.NewGuid(),
                ["emailaddress1"] = "duplicate@example.com"
            };

            _context.Initialize(new[] { existingContact });

            var newContact = new Entity("contact")
            {
                Id = Guid.NewGuid(),
                ["emailaddress1"] = "duplicate@example.com"
            };

            var pluginContext = _context.GetDefaultPluginContext();
            pluginContext.MessageName = "Create";
            pluginContext.PrimaryEntityName = "contact";
            pluginContext.InputParameters["Target"] = newContact;

            _context.ExecutePluginWith<DuplicateEmailCheck>(pluginContext);
        }


        [TestMethod]
        public void Should_Not_Throw_When_Email_Is_Unique()
        {
            // Arrange
            _context.Initialize(new Entity[] { });

            var newContact = new Entity("contact")
            {
                Id = Guid.NewGuid(),
                ["emailaddress1"] = "unique@example.com"
            };

            var pluginContext = _context.GetDefaultPluginContext();
            pluginContext.MessageName = "Create";
            pluginContext.PrimaryEntityName = "contact";
            pluginContext.InputParameters["Target"] = newContact;

            // Act + Assert
            try
            {
                _context.ExecutePluginWith<DuplicateEmailCheck>(pluginContext); 
                Assert.IsTrue(true); // If it doesn't throw, test passes
            }
            catch (InvalidPluginExecutionException)
            {
                Assert.Fail("Plugin should not throw for unique email.");
            }
        }
        [TestMethod]
        public void Should_Not_Throw_When_Email_Is_Missing()
        {
            var newContact = new Entity("contact")
            {
                Id = Guid.NewGuid()
                // No emailaddress1
            };

            var pluginContext = _context.GetDefaultPluginContext();
            pluginContext.MessageName = "Create";
            pluginContext.PrimaryEntityName = "contact";
            pluginContext.InputParameters["Target"] = newContact;

            try
            {
                _context.ExecutePluginWith<DuplicateEmailCheck>(pluginContext);
                Assert.IsTrue(true);
            }
            catch (Exception)
            {
                Assert.Fail("Plugin should not throw if email is not provided.");
            }
        }


    }
}
