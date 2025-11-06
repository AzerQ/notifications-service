using EF.DynamicFilters;
using EF.DynamicFilters.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NotificationService.Api.Authentication;
using NotificationService.Api.Authentication.Extensions;
using NotificationService.Application.DTOs;
using NotificationService.Application.Interfaces;
using NotificationService.Domain.Models;
using NotificationService.Domain.Models.InApp;
using NotificationService.Infrastructure.Data;

namespace NotificationService.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = AuthConfig.JwtAuthPolicyName)]
public class NotificationController(
    INotificationCommandService commandService,
    INotificationQueryService queryService,
    IInAppNotificationSender inAppNotificationSender,
    IQueryBuilder queryBuilder,
    NotificationDbContext notificationDb) : ControllerBase
{

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
        var result = await commandService.ProcessNotificationRequestAsync(request);
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
        var result = await queryService.GetByIdAsync(id);
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

        var result = await queryService.GetByUserAsync(userId);
        return Ok(result);
    }

    [HttpPost("search")]
    [ProducesResponseType(typeof(IReadOnlyCollection<Notification>), StatusCodes.Status200OK)]
    // [Authorize(Roles = UserRoles.Admin)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<IReadOnlyCollection<Notification>>> SearchNotificationsAsync([FromBody] QueryRequest queryRequest)
    {
        var query = queryBuilder.BuildQuery(notificationDb.Notifications, queryRequest);
        var result = await query.ToListAsync();
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
        await inAppNotificationSender.SendToAllAsync(request);

        return Ok(new { message = "Notification broadcast successfully" });
    }
}
