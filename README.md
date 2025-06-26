# Dynamics CRM Assessment

This repository contains my completed assessment for the Dynamics 365 CRM Developer role. It showcases full-stack CRM development skills, including client-side scripting, plugin development, Azure integration, Power Automate flow, and unit testing.

---

## 📁 Project Structure

### `pei-function-app/`
- Azure Function App using .NET 8 (Isolated Worker model).
- Receives data from Power Automate and securely forwards it to an external API.
- Authenticated using Azure Active Directory (OAuth 2.0 token-based).

### `pei-plugins/`
- **PEICustomPlugins/**: C# plugin implementations for Dynamics 365, including:
  - Preventing duplicate contacts based on email
  - Automatically creating child contacts upon account creation
  - Plugin step registration logic
  - **PEICustomPluginTest/** (inside): Unit test project for the above plugins.

### `Web Resources/`
- JavaScript files used as CRM form customizations.
- Includes logic for dynamically setting required fields and validating preferred contact methods on the Contact and Opportunity forms.
- Uses Xrm.Page and Dynamics 365 JavaScript client API.

### `Web Resources unit test/`
- Jest-based unit tests written using `xrm-mock`.
- Verifies form logic for JavaScript functions independently from Dynamics UI.

---

## 🔐 Security Highlights

- Azure Function is secured via Azure AD (App Registration + Token validation).
- Power Automate Flow is configured to authenticate via OAuth 2.0 using a client secret.
- All sensitive configurations (URLs, Client IDs, Secrets) are stored securely in **Power Platform Environment Variables**.

---

## 🚀 Getting Started

1. Clone this repository to your local machine.
2. Open the appropriate `.sln` files in Visual Studio 2017 or 2022.
3. Navigate to each folder to explore or execute:
   - `pei-function-app/`: Build and test the Azure Function
   - `PEICustomPlugins/`: Review plugin logic and run unit tests via `PEICustomPluginTest/`
   - `Web Resources/`: Review or deploy JS form logic
   - `Web Resources unit test/`: Run JavaScript unit tests using Node.js and Jest
4. Review the attached PDF for scenario-based explanations, screenshots, and technical walkthroughs.

---

## 📄 Included Use Cases

- **Form Logic**: Enforcing required fields on Contact form based on Preferred Method
- **Plugins**: Validation logic and automatic record creation
- **Power Automate**: Flow that calculates invoice totals and sends data to Azure Function
- **Integration**: Token-based secured connection from CRM to Azure + external API
- **XrmToolBox**: Bulk updates and metadata exports for Leads

---

## ✍️ Author

**Vishal Kurdekar**  
Dynamics CRM & Power Platform Developer  
[LinkedIn](https://www.linkedin.com/in/vishal-kurdekar) *(optional)*  
