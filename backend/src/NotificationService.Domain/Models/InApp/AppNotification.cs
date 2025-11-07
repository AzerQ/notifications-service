namespace NotificationService.Domain.Models.InApp
{
    /// <summary>
    /// Represents an additional parameter for a notification, with a key-value-description structure.
    /// </summary>
    public record NotificationParameter
    {
        /// <summary>
        /// The key of the parameter.
        /// </summary>
        public required string Key { get; set; }
        /// <summary>
        /// The value of the parameter.
        /// </summary>
        public required string Value { get; set; }
        /// <summary>
        /// A description of the parameter.
        /// </summary>
        public required string Description { get; set; }
    }

        /// <summary>
        /// Represents an In-App notification.
        /// </summary>
        public record AppNotification
        {
            /// <summary>
            /// The unique identifier of the notification.
            /// </summary>
            public Guid Id { get; set; }

            public string ReceiverId {get; set;} = null!;

            /// <summary>
            /// The type of the notification.
            /// </summary>
            public string? Type { get; set; }

            public string? SubType {get; set;}

            /// <summary>
            /// The title of the notification.
            /// </summary>
            public required string Title { get; set; }
            /// <summary>
            /// The content of the notification.
            /// </summary>
            public required string Content { get; set; }

            public required string Url {get; set;}

            public string? Icon { get; set; }

            /// <summary>
            /// The date and time the notification was created.
            /// </summary>
            public DateTime Date { get; set; }
            /// <summary>
            /// A flag indicating whether the notification has been read.
            /// </summary>
            public bool Read { get; set; } = false;
            /// <summary>
            /// Name author of the notification.
            /// </summary>
            public string? Author { get; set; }
            /// <summary>
            /// A list of actions associated with the notification.
            /// </summary>
            public List<NotificationAction>? Actions { get; set; }
            /// <summary>
            /// A list of hashtags associated with the notification.
            /// </summary>
            public List<string>? Hashtags { get; set; }
            /// <summary>
            /// A list of parameters associated with the notification.
            /// </summary>
            public List<NotificationParameter>? Parameters { get; set; }
        }

    /// <summary>
    /// Represents an action that can be performed on a notification.
    /// </summary>
    public record NotificationAction
    {
        /// <summary>
        /// The name of the action.
        /// </summary>
        public required string Name {get; set; }
        /// <summary>
        /// The label of the action.
        /// </summary>
        public required string Label {get; set; }
        /// <summary>
        /// The URL of the action.
        /// </summary>
        public required string Url {get; set; }
    }
}