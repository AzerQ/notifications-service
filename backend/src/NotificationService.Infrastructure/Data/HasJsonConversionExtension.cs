using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System.Text.Json;

namespace NotificationService.Infrastructure.Data
{
    /// <summary>
    /// Предоставляет методы расширения для настройки JSON-преобразования свойств Entity Framework Core.
    /// </summary>
    public static class HasJsonConversionExtension
    {
        /// <summary>
        /// Настраивает преобразование свойства сущности в JSON-строку и обратно для хранения в базе данных.
        /// </summary>
        /// <typeparam name="T">Тип свойства, который должен быть классом со стандартным конструктором.</typeparam>
        /// <param name="propertyBuilder">Построитель свойства Entity Framework Core.</param>
        /// <remarks>
        /// Использует <see cref="JsonSerializer"/> для сериализации объекта в JSON-строку при сохранении
        /// и десериализации JSON-строки обратно в объект при чтении из базы данных.
        /// Если десериализация возвращает null, создается новый экземпляр типа T.
        /// </remarks>
        public static void HasJsonConversion<T>(this PropertyBuilder<T> propertyBuilder) where T : class, new()
        {
            var converter = new Microsoft.EntityFrameworkCore.Storage.ValueConversion.ValueConverter<T, string>(
                v => JsonSerializer.Serialize(v, JsonSerializerOptions.Default),
                v => string.IsNullOrWhiteSpace(v) ? null! : JsonSerializer.Deserialize<T>(v, JsonSerializerOptions.Default)!
            );
            propertyBuilder.HasConversion(converter);
        }
    }
}
