// ToastService: stato CENTRALE delle notifiche "toast". Qualsiasi pagina lo inietta e chiama
// ShowSuccess/ShowError; il componente ToastHost (nel layout) si iscrive all'evento Changed
// e si ridisegna. TimeProvider permette nei test di "far scorrere il tempo" senza attese reali.
namespace CSharpFrontendTemplate.Services;

public enum ToastLevel
{
    Info,
    Success,
    Warning,
    Error,
}

public sealed record ToastMessage(Guid Id, string Message, ToastLevel Level);

public sealed class ToastService(TimeProvider timeProvider) : IDisposable
{
    public static readonly TimeSpan DefaultDuration = TimeSpan.FromSeconds(4);

    private readonly List<ToastMessage> _toasts = [];
    private readonly Dictionary<Guid, ITimer> _timers = [];

    /// <summary>Evento lanciato a ogni aggiunta/rimozione: i componenti iscritti chiamano StateHasChanged.</summary>
    public event Action? Changed;

    public IReadOnlyList<ToastMessage> Toasts => _toasts;

    public ToastMessage Show(string message, ToastLevel level = ToastLevel.Info, TimeSpan? duration = null)
    {
        var toast = new ToastMessage(Guid.NewGuid(), message, level);
        _toasts.Add(toast);
        Changed?.Invoke();
        ScheduleDismiss(toast.Id, duration ?? DefaultDuration);
        return toast;
    }

    public ToastMessage ShowSuccess(string message) => Show(message, ToastLevel.Success);

    public ToastMessage ShowError(string message) => Show(message, ToastLevel.Error);

    public void Dismiss(Guid id)
    {
        if (_timers.Remove(id, out var timer))
        {
            timer.Dispose();
        }

        if (_toasts.RemoveAll(t => t.Id == id) > 0)
        {
            Changed?.Invoke();
        }
    }

    // Timer che rimuove il toast dopo la durata. TimeSpan.Zero = resta finché non lo chiudi.
    // Timeout.InfiniteTimeSpan come "period" = il timer scatta una sola volta.
    private void ScheduleDismiss(Guid id, TimeSpan duration)
    {
        if (duration <= TimeSpan.Zero)
        {
            return;
        }

        _timers[id] = timeProvider.CreateTimer(_ => Dismiss(id), null, duration, Timeout.InfiniteTimeSpan);
    }

    public void Dispose()
    {
        foreach (var timer in _timers.Values)
        {
            timer.Dispose();
        }

        _timers.Clear();
    }
}
