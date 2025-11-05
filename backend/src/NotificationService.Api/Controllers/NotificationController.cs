using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NotificationService.Api.Authentication;
using NotificationService.Api.Authentication.Extensions;
using NotificationService.Application.DTOs;
using NotificationService.Application.Interfaces;
using NotificationService.Domain.Models;
using NotificationService.Domain.Models.InApp;

namespace NotificationService.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = AuthConfig.JwtAuthPolicyName)]
public class NotificationController : ControllerBase
{
    private readonly INotificationCommandService _commandService;
    private readonly INotificationQueryService _queryService;
    private readonly IInAppNotificationSender _inAppNotificationSender;

    public NotificationController(
        INotificationCommandService commandService,
        INotificationQueryService queryService,
        IInAppNotificationSender inAppNotificationSender)
    {
        _commandService = commandService ?? throw new ArgumentNullException(nameof(commandService));
        _queryService = queryService ?? throw new ArgumentNullException(nameof(queryService));
        _inAppNotificationSender = inAppNotificationSender;
    }

    /// <summary>
    /// Creates a new notification.
    /// </summary>
    /// <param name="request">Notification data.</param>
    /// <returns>Created notification.</returns>
    [HttpPost("{notificationCategory?}/{route}")]
    [ProducesResponseType(typeof(NotificationResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [Authorize(Roles = $"{UserRoles.Admin},{UserRoles.ExternalApiClient}")]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<NotificationResponseDto>> SendAsync(NotificationRequest request)
    {
        var result = await _commandService.ProcessNotificationRequestAsync(request);
        return Created(nameof(NotificationResponseDto), result);
    }

    /// <summary>
    /// Gets a notification by ID.
    /// </summary>
    /// <param name="id">Notification ID.</param>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(NotificationResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
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
    /// Gets a list of notifications by user.
    /// Regular users can only retrieve their own notifications, administrators can retrieve any.
    /// </summary>
    /// <param name="userId">User ID.</param>
    [HttpGet("by-user/{userId:guid}")]
    [ProducesResponseType(typeof(IReadOnlyCollection<NotificationResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<IReadOnlyCollection<NotificationResponseDto>>> GetByUserAsync(Guid userId)
    {
      var currentUserId = User.GetApplicationUser().Id;
      
        // Permission check: user can only retrieve their own notifications, except administrators
        if (currentUserId != userId && !User.IsAdmin())
        {
            return Forbid();
        }

        var result = await _queryService.GetByUserAsync(userId);
        return Ok(result);
    }

    /// <summary>
    /// Gets a list of notifications by status.
    /// </summary>
    /// <param name="status">Status (Pending|Sent|Failed|Delivered).</param>
    [HttpGet("by-status/{status}")]
    [ProducesResponseType(typeof(IReadOnlyCollection<NotificationResponseDto>), StatusCodes.Status200OK)]
    [Authorize(Roles = UserRoles.Admin)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<IReadOnlyCollection<NotificationResponseDto>>> GetByStatusAsync(string status)
    {
        var result = await _queryService.GetByStatusAsync(status);
        return Ok(result);
    }

    /// <summary>
    /// Test endpoint to broadcast a notification via SignalR
    /// </summary>
    [HttpPost("broadcast")]
    [Authorize(Roles = UserRoles.Admin)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult> BroadcastInAppNotification([FromBody] InAppNotification request)
    {
        await _inAppNotificationSender.SendToAllAsync(request);

        return Ok(new { message = "Notification broadcast successfully" });
    }
}
