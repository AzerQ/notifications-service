using System.Reflection;

namespace NotificationService.Application.Extensions;

public static class AssemblyGetImpTypeExtension
{
    public static IEnumerable<Type> GetImplementingTypes(this Assembly assembly, Type baseType)
    {
        return assembly
            .GetTypes()
            .Where(t => baseType.IsAssignableFrom(t)
                        && t is { IsClass: true, IsAbstract: false });
    }
}