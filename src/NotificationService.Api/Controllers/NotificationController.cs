using Microsoft.AspNetCore.Mvc;
using NotificationService.Application.DTOs;
using NotificationService.Application.Interfaces;
using NotificationService.Domain.Models;

namespace NotificationService.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotificationController : ControllerBase
{
    private readonly INotificationCommandService _commandService;
    private readonly INotificationQueryService _queryService;

    public NotificationController(
        INotificationCommandService commandService,
        INotificationQueryService queryService)
    {
        _commandService = commandService ?? throw new ArgumentNullException(nameof(commandService));
        _queryService = queryService ?? throw new ArgumentNullException(nameof(queryService));
    }

    /// <summary>
    /// Создает новое уведомление.
    /// </summary>
    /// <param name="request">Данные уведомления.</param>
    /// <returns>Созданное уведомление.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(NotificationResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<NotificationResponseDto>> SendAsync([FromBody] NotificationRequest request)
    {
        var result = await _commandService.ProcessNotificationRequestAsync(request);
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
}
