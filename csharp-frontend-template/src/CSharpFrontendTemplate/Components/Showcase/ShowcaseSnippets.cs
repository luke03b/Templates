// ShowcaseSnippets: testo del codice mostrato (e copiabile) nella pagina Components.
// Tenuto in un file C# separato per non appesantire il markup della pagina.
namespace CSharpFrontendTemplate.Components.Showcase;

internal static class ShowcaseSnippets
{
    public const string Typography = """
        <h1>Heading 1</h1>
        <h2>Heading 2</h2>
        <p class="lead">Lead paragraph</p>
        <p>Body text with <code>inline code</code> and <a href="#">a link</a>.</p>
        <p class="text-muted">Muted text</p>
        """;

    public const string Buttons = """
        <AppButton>Primary</AppButton>
        <AppButton Variant="ButtonVariant.Secondary">Secondary</AppButton>
        <AppButton Variant="ButtonVariant.Danger">Danger</AppButton>
        <AppButton Variant="ButtonVariant.Ghost">Ghost</AppButton>
        <AppButton Disabled="true">Disabled</AppButton>
        <AppButton Loading="_saving" OnClick="SaveAsync">Save</AppButton>
        """;

    public const string Form = """
        <EditForm Model="_model" OnValidSubmit="OnSubmit">
            <DataAnnotationsValidator />
            <FormField Label="Full name" InputId="fullName" For="() => _model.FullName" Required="true">
                <InputText id="fullName" class="input" @bind-Value="_model.FullName" />
            </FormField>
            <FormField Label="Role" InputId="role" For="() => _model.Role">
                <InputSelect id="role" class="input" @bind-Value="_model.Role">
                    <option value="">Select...</option>
                    <option value="dev">Developer</option>
                </InputSelect>
            </FormField>
            <FormField Label="Plan" For="() => _model.Plan" Fieldset="true">
                <InputRadioGroup @bind-Value="_model.Plan">
                    <label class="check"><InputRadio Value="@("free")" /> Free</label>
                    <label class="check"><InputRadio Value="@("pro")" /> Pro</label>
                </InputRadioGroup>
            </FormField>
            <FormField For="() => _model.Newsletter">
                <InputSwitch @bind-Value="_model.Newsletter" Label="Newsletter" />
            </FormField>
            <FormField For="() => _model.AcceptTerms">
                <label class="check"><InputCheckbox @bind-Value="_model.AcceptTerms" /> I accept the terms</label>
            </FormField>
            <AppButton Type="submit">Submit</AppButton>
        </EditForm>
        """;

    public const string Card = """
        <Card Title="Card title" Subtitle="Subtitle">
            <ChildContent>Card body content.</ChildContent>
            <Footer><AppButton Size="ButtonSize.Small">Action</AppButton></Footer>
        </Card>
        """;

    public const string Alerts = """
        <Alert Tone="Tone.Info" Title="Info">Something you should know.</Alert>
        <Alert Tone="Tone.Success">Saved successfully.</Alert>
        <Alert Tone="Tone.Warning">Check your input.</Alert>
        <Alert Tone="Tone.Danger" OnDismiss="() => _visible = false">Something went wrong.</Alert>
        """;

    public const string Toasts = """
        @inject ToastService Toasts

        <AppButton OnClick='() => Toasts.ShowSuccess("Saved!")'>Show toast</AppButton>
        <AppButton OnClick='() => Toasts.ShowError("Failed!")'>Show error</AppButton>
        """;

    public const string Modal = """
        <AppButton OnClick="() => _open = true">Open modal</AppButton>

        <Modal @bind-IsOpen="_open" Title="Modal title">
            <ChildContent>Modal body.</ChildContent>
            <Footer>
                <AppButton Variant="ButtonVariant.Secondary" OnClick="() => _open = false">Close</AppButton>
            </Footer>
        </Modal>
        """;

    public const string Tabs = """
        <Tabs>
            <TabPanel Title="Overview">First tab content.</TabPanel>
            <TabPanel Title="Details">Second tab content.</TabPanel>
            <TabPanel Title="Settings">Third tab content.</TabPanel>
        </Tabs>
        """;

    public const string Table = """
        <QuickGrid Items="_people" Pagination="_pagination" Class="table">
            <PropertyColumn Property="p => p.Name" Sortable="true" />
            <PropertyColumn Property="p => p.Role" Sortable="true" />
            <TemplateColumn Title="Status" Context="p">
                <Badge Tone="p.Active ? Tone.Success : Tone.Neutral">@(p.Active ? "Active" : "Inactive")</Badge>
            </TemplateColumn>
        </QuickGrid>
        <Paginator State="_pagination" />
        """;

    public const string Badges = """
        <Badge>Neutral</Badge>
        <Badge Tone="Tone.Info">Info</Badge>
        <Badge Tone="Tone.Success">Success</Badge>
        <Badge Tone="Tone.Warning">Warning</Badge>
        <Badge Tone="Tone.Danger">Danger</Badge>
        """;

    public const string Spinner = """
        <Spinner Size="ButtonSize.Small" />
        <Spinner />
        <Spinner Size="ButtonSize.Large" Label="Loading data" />
        <StatusIndicator Status="StatusIndicator.ServiceStatus.Online" />
        """;

    public const string Navigation = """
        @inject NavigationManager Navigation

        <NavLink class="navbar-link" href="items">Items</NavLink>
        <AppButton OnClick='() => Navigation.NavigateTo("items")'>Go to items</AppButton>
        """;
}
