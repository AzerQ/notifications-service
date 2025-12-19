$ServiceName = "AdvancedNotificationsService"
$AppDir = (Get-Item $PSScriptRoot).Parent.FullName
$ServiceExecutable = "$AppDir\NotificationService.Api.exe"
$ServiceUser = "DOMAIN\user"
$ServiceDescription = "Service for email and InApp notifications"


Export-ModuleMember -Variable ServiceName, AppDir, ServiceExecutable, ServiceUser, ServiceDescription 