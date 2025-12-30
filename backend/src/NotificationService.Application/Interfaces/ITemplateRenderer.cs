using System.Text.Json;

namespace NotificationService.Application.Interfaces;

public interface ITemplateRenderer
{
    /// <summary>
    /// Рендерит шаблон с использованием данных JsonElement.
    /// </summary>
    /// <param name="template">Шаблон (строка Handlebars).</param>
    /// <param name="data">Данные для подстановки.</param>
    /// <param name="additionalData">Дополнительные данные (обращаение к полям этих данных идет через @field)</param>
    /// <returns>Результат рендеринга.</returns>
    string Render(string template, object data, object? additionalData = null);
}
