using System.Net;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace DynamicsCEIntegration;

public class SendOrderdataToExternalAPI
{
    private readonly ILogger<SendOrderdataToExternalAPI> _logger;
    private readonly HttpClient _httpClient;

    public SendOrderdataToExternalAPI(
        ILogger<SendOrderdataToExternalAPI> logger,
        IHttpClientFactory httpClientFactory)
    {
        _logger = logger;
        _httpClient = httpClientFactory.CreateClient();
    }

    [Function("SendOrderdataToExternalAPI")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Function, "post")] HttpRequestData req)
    {
        _logger.LogInformation("Processing order request...");

        // Read request body
        string body = await new StreamReader(req.Body).ReadToEndAsync();
        OrderModel? order;

        try
        {
            order = JsonSerializer.Deserialize<OrderModel>(body, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Deserialization error: {ex.Message}");
            var badResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await badResponse.WriteStringAsync("Invalid JSON format.");
            return badResponse;
        }

        if (order == null || string.IsNullOrWhiteSpace(order.CustomerName))
        {
            _logger.LogWarning("Missing or invalid order data.");
            var invalidResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await invalidResponse.WriteStringAsync("Missing or invalid order data.");
            return invalidResponse;
        }

        // Read API URL from environment
        string? apiUrl = Environment.GetEnvironmentVariable("apiUrl");
        if (string.IsNullOrWhiteSpace(apiUrl))
        {
            _logger.LogError("apiUrl environment variable is missing.");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteStringAsync("apiUrl environment variable is missing.");
            return errorResponse;
        }

        _logger.LogInformation($"Sending order to external API: {apiUrl}");

        // Prepare request payload
        var payload = new StringContent(JsonSerializer.Serialize(order), Encoding.UTF8, "application/json");

        try
        {
            var response = await _httpClient.PostAsync(apiUrl, payload);
            if (response.IsSuccessStatusCode)
            {
                var successResponse = req.CreateResponse(HttpStatusCode.OK);
                await successResponse.WriteAsJsonAsync(new
                {
                    status = "success",
                    message = "Order sent successfully.",
                    order
                });
                return successResponse;
            }
            else
            {
                _logger.LogError($"External API returned status code: {response.StatusCode}");
                var failResponse = req.CreateResponse(HttpStatusCode.BadGateway);
                await failResponse.WriteStringAsync("External API call failed.");
                return failResponse;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError($"Exception during API call: {ex.Message}");
            var exceptionResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await exceptionResponse.WriteStringAsync("Failed to send order due to an exception.");
            return exceptionResponse;
        }
    }

    // Inlined model class
    private class OrderModel
    {
        public string CustomerName { get; set; } = string.Empty;
        public decimal OrderTotal { get; set; }
        public DateTime OrderDate { get; set; }
    }
}
