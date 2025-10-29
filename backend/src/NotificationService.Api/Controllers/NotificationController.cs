using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using NotificationService.Api.Hubs;
using NotificationService.Application.DTOs;
using NotificationService.Application.Interfaces;

namespace NotificationService.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotificationController : ControllerBase
{
    private readonly INotificationCommandService _commandService;
    private readonly INotificationQueryService _queryService;
    private readonly IHubContext<NotificationHub> _hubContext;

    public NotificationController(
        INotificationCommandService commandService,
        INotificationQueryService queryService,
        IHubContext<NotificationHub> hubContext)
    {
        _commandService = commandService ?? throw new ArgumentNullException(nameof(commandService));
        _queryService = queryService ?? throw new ArgumentNullException(nameof(queryService));
        _hubContext = hubContext ?? throw new ArgumentNullException(nameof(hubContext));
    }

    /// <summary>
    /// Создает новое уведомление.
    /// </summary>
    /// <param name="request">Данные уведомления.</param>
    /// <returns>Созданное уведомление.</returns>
    [HttpPost("{notificationCategory?}/{route}")]
    [ProducesResponseType(typeof(NotificationResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<NotificationResponseDto>> SendAsync(NotificationRequest request)
    {
        var result = await _commandService.ProcessNotificationRequestAsync(request);
        
        // Send targeted notifications via SignalR to specific users
        if (result.Recipients != null && result.Recipients.Any())
        {
            foreach (var recipient in result.Recipients)
            {
                await _hubContext.Clients.User(recipient.Id.ToString()).SendAsync("ReceiveNotification", new
                {
                    id = result.CreatedNotificationIds?.FirstOrDefault() ?? Guid.NewGuid(),
                    title = result.Title,
                    message = result.StatusMessage,
                    route = result.Route,
                    createdAt = result.CreatedAt,
                    userId = recipient.Id
                });
            }
        }
        else
        {
            // Fallback to broadcast if no specific users
            await _hubContext.Clients.All.SendAsync("ReceiveNotification", new
            {
                id = result.CreatedNotificationIds?.FirstOrDefault() ?? Guid.NewGuid(),
                title = result.Title,
                message = result.StatusMessage,
                route = result.Route,
                createdAt = result.CreatedAt
            });
        }
        
        return Created(nameof(NotificationResponseDto), result);
    }

    /// <summary>
    /// Возвращает уведомление по идентификатору.
    /// </summary>
    /// <param name="id">Идентификатор уведомления.</param>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(NotificationResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<NotificationResponseDto>> GetByIdAsync(Guid id)
    {
        var result = await _queryService.GetByIdAsync(id);
        if (result is null)
        {
            return NotFound();
        }

        return Ok(result);
    }

    /// <summary>
    /// Возвращает список уведомлений по пользователю.
    /// </summary>
    /// <param name="userId">Идентификатор пользователя.</param>
    [HttpGet("by-user/{userId:guid}")]
    [ProducesResponseType(typeof(IReadOnlyCollection<NotificationResponseDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyCollection<NotificationResponseDto>>> GetByUserAsync(Guid userId)
    {
        var result = await _queryService.GetByUserAsync(userId);
        return Ok(result);
    }

    /// <summary>
    /// Возвращает список уведомлений по статусу.
    /// </summary>
    /// <param name="status">Статус (Pending|Sent|Failed|Delivered).</param>
    [HttpGet("by-status/{status}")]
    [ProducesResponseType(typeof(IReadOnlyCollection<NotificationResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<IReadOnlyCollection<NotificationResponseDto>>> GetByStatusAsync(string status)
    {
        var result = await _queryService.GetByStatusAsync(status);
        return Ok(result);
    }

    /// <summary>
    /// Test endpoint to broadcast a notification via SignalR
    /// </summary>
    [HttpPost("broadcast")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult> BroadcastTestNotification([FromBody] BroadcastTestRequest request)
    {
        await _hubContext.Clients.All.SendAsync("ReceiveNotification", new
        {
            id = Guid.NewGuid(),
            title = request.Title ?? "Test Notification",
            message = request.Message ?? "This is a test notification",
            route = request.Route ?? "Test",
            createdAt = DateTime.Now
        });
        
        return Ok(new { message = "Notification broadcast successfully" });
    }
}

public class BroadcastTestRequest
{
    public string? Title { get; set; }
    public string? Message { get; set; }
    public string? Route { get; set; }
}
