namespace NotificationService.Domain.Models.InApp
{
    public record NotificationParameter
    {
        public string Key { get; set; }
        public string Value { get; set; }
        public string Description { get; set; }
    }

    public record InAppNotification
    {
        
        public string Id { get; set; }
        public string Type { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public DateTime Date { get; set; }
        public bool Read { get; set; }
        public string? Author { get; set; }
        public List<NotificationAction>? Actions { get; set; }
        public List<string>? Hashtags { get; set; }
        public List<NotificationParameter>? Parameters { get; set; }
    }

    public record NotificationAction
    {
        public string Name {get; set; }
        public string Label {get; set; }
        public string Url {get; set; }
    }
}