# Use the SDK image to build the app
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy solution and project files
COPY NotificationService.sln ./
COPY src/NotificationService.Api/NotificationService.Api.csproj src/NotificationService.Api/
COPY src/NotificationService.Application/NotificationService.Application.csproj src/NotificationService.Application/
COPY src/NotificationService.Domain/NotificationService.Domain.csproj src/NotificationService.Domain/
COPY src/NotificationService.Infrastructure/NotificationService.Infrastructure.csproj src/NotificationService.Infrastructure/
COPY src/EF.DynamicFilters/EF.DynamicFilters.csproj src/EF.DynamicFilters/
COPY JwtSecretGenerator/JwtSecretGenerator.csproj JwtSecretGenerator/
COPY src/NotificationService.TestHandlers/NotificationService.TestHandlers.csproj src/NotificationService.TestHandlers/

# Restore dependencies
RUN dotnet restore

# Copy everything else and build
COPY . ./
RUN dotnet publish src/NotificationService.Api/NotificationService.Api.csproj -c Release -o out

# Use the runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/out .

# Create directory for SQLite database and templates if they don't exist
RUN mkdir -p /app/Notifications

# Expose the port the app runs on
EXPOSE 5093
ENV ASPNETCORE_URLS=http://+:5093

ENTRYPOINT ["dotnet", "NotificationService.Api.dll"]
