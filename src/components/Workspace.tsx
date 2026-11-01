import { sentProposalGrossCents } from "../data/sentProposals";
import { useState } from "react";
import { demoProjects, type DemoProject } from "../data/demoProjects";
import { WorkspaceIcon as Icon } from "./WorkspaceIcon";
import { BrandLogo } from "./BrandLogo";
import { PreferenceControls } from "./PreferenceControls";
import { ProjectDetails } from "./ProjectDetails";
import { ProjectChat, ConversationMenu, type ChatPanel } from "./ProjectChat";
import {
  loadProjectTracking,
  saveProjectTracking,
} from "../data/projectChat";
import {
  projectStatuses,
  closedStatuses,
  statusLabel,
  type ProjectStatus,
} from "../data/projectStatus";

type Page = "dashboard" | "requests" | "projects";
interface Props {
  de: boolean;
  mobile: boolean;
  onLogout: () => void;
  onMobileChange: (value: boolean) => void;
  onLanguageChange: (language: "en" | "de") => void;
}
export function Workspace({
  de,
  mobile,
  onLogout,
  onMobileChange,
  onLanguageChange,
}: Props) {
  const [page, setPage] = useState<Page>("dashboard");
  const [menu, setMenu] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [projects, setProjects] = useState(() => {
    try {
      return loadProjectTracking(demoProjects);
    } catch {
      return demoProjects;
    }
  });
  const [visitError, setVisitError] = useState("");
  const [projectView, setProjectView] = useState<"details" | "chat">("chat");
  const [chatPanel, setChatPanel] = useState<ChatPanel>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<ProjectStatus | "all">("all");
  const project = projects.find((p) => p.id === selectedId) ?? null;
  const requests = projects.filter((p) => p.status === "new");
  const managedProjects = projects.filter((p) => p.status !== "new");
  const ongoing = managedProjects.filter(
    (p) => !closedStatuses.includes(p.status),
  );
  function openProject(item: DemoProject) {
    setSelectedId(item.id);
    setProjectView("chat");
    setChatPanel(null);
  }

  function updateProject(status: ProjectStatus, inspected: boolean) {
    if (!project) return;
    try {
      saveProjectTracking({ ...project, status, inspected });
      setVisitError("");
    } catch {
      setVisitError(
        de
          ? "Status konnte nicht dauerhaft gespeichert werden. Änderung gilt für diese Sitzung."
          : "Status could not be saved permanently. This change applies to the current session.",
      );
    }
    setProjects((items) =>
      items.map((item) =>
        item.id === project.id ? { ...item, status, inspected } : item,
      ),
    );
  }

  const nav = [
    { key: "dashboard", icon: "dashboard", label: "Dashboard" },
    {
      key: "requests",
      icon: "new",
      label: de ? "Neue Anfragen" : "New requests",
    },
    { key: "projects", icon: "projects", label: de ? "Projekte" : "Projects" },
  ] as const;
  const current = nav.find((item) => item.key === page)!;
  const format = (amount: number) =>
    new Intl.NumberFormat(de ? "de-DE" : "en-IE", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(amount);
  const status = (value: ProjectStatus) => statusLabel(value, de);
  function navigate(next: Page) {
    setPage(next);
    if (next === "projects") setProjectsOpen(true);
    setSelectedId(null);
    setFilter("all");
    setMenu(false);
  }
  function rows(items: DemoProject[]) {
    return (
      <div className="project-list">
        {items.map((item) => (
          <button
            className="project-row"
            key={item.id}
            onClick={() => openProject(item)}
          >
            <img src={item.image} alt="" width="64" height="64" />
            <div className="project-copy">
              <div className="project-title">
                <span>{de ? item.nameDe : item.name}</span>
                <small>{item.id}</small>
              </div>
              <div className="project-meta">
                <span className="type-meta">
                  <Icon name="home" size={14} />
                  {de ? item.typeDe : item.type}
                </span>
                <span>·</span>
                <span className="type-meta">
                  <Icon name="pin" size={13} />
                  {item.city}
                </span>
                {item.status !== "new" && sentProposalGrossCents(item.id) !== null && (
                  <>
                    <span>·</span>
                    <span title={de ? "Zuletzt gesendetes Angebot · brutto" : "Latest sent proposal · gross"}>
                      {new Intl.NumberFormat(de ? "de-DE" : "en-IE", { style: "currency", currency: "EUR" }).format(sentProposalGrossCents(item.id)! / 100)}
                    </span>
                  </>
                )}
              </div>
              {item.inspected && (
                <span className="inspection-indicator">
                  ✓ {de ? "Besichtigung abgeschlossen" : "Site visit completed"}
                </span>
              )}
            </div>
            <span className={`status-pill status-${item.status}`}>
              {status(item.status)}
            </span>
            <span className="row-chevron">
              <Icon name="chevron" size={17} />
            </span>
          </button>
        ))}
      </div>
    );
  }
  return (
    <div
      className={`workspace-layout ${mobile ? "compact-workspace" : ""}`}
      onKeyDown={(event) => {
        if (event.key === "Escape") setMenu(false);
      }}
    >
      {menu && (
        <button
          className="sidebar-backdrop"
          aria-label={de ? "Navigation schließen" : "Close navigation"}
          onClick={() => setMenu(false)}
        />
      )}
      <aside className={`workspace-sidebar ${menu ? "sidebar-open" : ""}`}>
        <div className="workspace-brand">
          <BrandLogo />
          <div>
            <strong>RenovAIte</strong>
            <small>{de ? "HANDWERKER" : "CRAFTSMAN"}</small>
          </div>
          <button
            className="close-sidebar"
            aria-label={de ? "Menü schließen" : "Close menu"}
            onClick={() => setMenu(false)}
          >
            <Icon name="close" />
          </button>
        </div>
        <nav aria-label={de ? "Hauptnavigation" : "Main navigation"}>
          {nav.map((item) => (
            <div key={item.key}>
              <button
                onClick={() => {
                  if (item.key === "projects") {
                    setProjectsOpen(!projectsOpen);
                    setPage("projects");
                    setSelectedId(null);
                    setFilter("all");
                  } else navigate(item.key);
                }}
                aria-current={
                  page === item.key && item.key !== "projects"
                    ? "page"
                    : undefined
                }
                data-active={page === item.key}
                aria-expanded={
                  item.key === "projects" ? projectsOpen : undefined
                }
                aria-controls={
                  item.key === "projects"
                    ? "project-status-navigation"
                    : undefined
                }
              >
                <Icon name={item.icon} />
                {item.label}
                {item.key === "requests" && (
                  <span className="nav-count">{requests.length}</span>
                )}
                {item.key === "projects" && (
                  <span
                    className={`projects-chevron ${projectsOpen ? "expanded" : ""}`}
                  >
                    <Icon name="chevron" size={14} />
                  </span>
                )}
              </button>
              {item.key === "projects" && projectsOpen && (
                <div
                  id="project-status-navigation"
                  className="project-subnav"
                  role="group"
                  aria-label={de ? "Projektstatus" : "Project statuses"}
                >
                  {(
                    [
                      "all",
                      ...projectStatuses.filter((value) => value !== "new"),
                    ] as const
                  ).map((value) => (
                    <button
                      key={value}
                      aria-current={
                        page === "projects" && filter === value
                          ? "page"
                          : undefined
                      }
                      onClick={() => {
                        setPage("projects");
                        setSelectedId(null);
                        setFilter(value);
                        setMenu(false);
                      }}
                    >
                      <span
                        className={`subnav-dot ${value !== "all" ? `status-dot-${value}` : ""}`}
                      />
                      <span>
                        {value === "all"
                          ? de
                            ? "Alle Projekte"
                            : "All projects"
                          : status(value)}
                      </span>
                      <small>
                        {value === "all"
                          ? managedProjects.length
                          : managedProjects.filter((p) => p.status === value)
                              .length}
                      </small>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <details className="sidebar-settings">
          <summary>
            <Icon name="settings" />
            {de ? "Einstellungen" : "Settings"}
            <span className="settings-chevron">
              <Icon name="chevron" size={14} />
            </span>
          </summary>
          <PreferenceControls
            de={de}
            mobile={mobile}
            onMobileChange={(value) => {
              onMobileChange(value);
              setMenu(value);
            }}
            onLanguageChange={onLanguageChange}
          />
        </details>
        <div className="sidebar-bottom">
          <p>{de ? "Ihr Handwerker-Workspace" : "Your craftsman workspace"}</p>
          <button onClick={onLogout}>
            <Icon name="logout" size={18} />
            {de ? "Abmelden" : "Log out"}
          </button>
        </div>
      </aside>
      <div className="workspace-body">
        <header className="workspace-header">
          <div className="workspace-heading">
            <button
              className="open-sidebar"
              aria-label={de ? "Navigation öffnen" : "Open navigation"}
              onClick={() => setMenu(true)}
            >
              <Icon name="menu" />
            </button>
            <span className="header-page-icon">
              <Icon name={current.icon} size={18} />
            </span>
            <div>
              <h1>
                {project
                  ? de
                    ? project.nameDe
                    : project.name
                  : page === "projects" && filter !== "all"
                    ? status(filter)
                    : current.label}
              </h1>
              <p>
                {project
                  ? project.id
                  : {
                      dashboard: de
                        ? "Ihre Projekte auf einen Blick"
                        : "Your projects at a glance",
                      requests: de
                        ? "Neue Renovierungsanfragen prüfen"
                        : "Review incoming renovation requests",
                      projects: de
                        ? "Alle bestätigten und abgeschlossenen Vorgänge"
                        : "All acknowledged and closed requests in one place",
                    }[page]}
              </p>
            </div>
          </div>
          {project && projectView === "chat" && (
            <ConversationMenu
              de={de}
              onPanel={setChatPanel}
              onDetails={() => {
                setProjectView("details");
                setChatPanel(null);
              }}
              onBack={() => {
                setSelectedId(null);
                setChatPanel(null);
              }}
            />
          )}
        </header>
        <div
          className={`workspace-content ${project && projectView === "chat" ? "workspace-chat-content" : ""}`}
        >
          {visitError && (
            <p role="alert" className="conversation-error">
              {visitError}
            </p>
          )}
          {project ? (
            projectView === "chat" ? (
              <ProjectChat
                key={project.id}
                project={project}
                de={de}
                panel={chatPanel}
                onClosePanel={() => setChatPanel(null)}
                onPanel={setChatPanel}
                onUpdate={updateProject}
              />
            ) : (
              <ProjectDetails
                key={project.id}
                project={project}
                de={de}
                onBack={() => setSelectedId(null)}
                onUpdate={updateProject}
                onChat={() => setProjectView("chat")}
              />
            )
          ) : (
            <>
              {page === "dashboard" && (
                <>
                  <section
                    className="stats-grid"
                    aria-label={de ? "Projektkennzahlen" : "Project summary"}
                  >
                    {[
                      {
                        icon: "new" as const,
                        color: "blue",
                        label: de ? "Neue Anfragen" : "New requests",
                        value: requests.length,
                        note: de
                          ? "noch nicht bestätigt"
                          : "not yet acknowledged",
                      },
                      {
                        icon: "projects" as const,
                        color: "purple",
                        label: de ? "Laufende Projekte" : "Ongoing projects",
                        value: ongoing.length,
                        note: de
                          ? "bestätigt und in Bearbeitung"
                          : "acknowledged and underway",
                      },
                      {
                        icon: "euro" as const,
                        color: "amber",
                        label: de ? "Offenes Gesamtvolumen" : "Open pipeline",
                        value: format(
                          projects
                            .filter((p) => !closedStatuses.includes(p.status))
                            .reduce((sum, p) => sum + p.budget, 0),
                        ),
                        note: de
                          ? "ohne abgeschlossene Vorgänge"
                          : "excluding closed projects",
                      },
                      {
                        icon: "send" as const,
                        color: "green",
                        label: de ? "Angebote gesendet" : "Proposals sent",
                        value: projects.filter(
                          (p) => p.status === "proposal_sent",
                        ).length,
                        note: de
                          ? "Kundenentscheidung ausstehend"
                          : "awaiting customer decision",
                      },
                    ].map((item) => (
                      <article className="stat-card" key={item.label}>
                        <span className={`stat-icon ${item.color}`}>
                          <Icon name={item.icon} size={24} />
                        </span>
                        <div className="stat-body">
                          <h2>{item.label}</h2>
                          <strong>{item.value}</strong>
                          <p>{item.note}</p>
                        </div>
                      </article>
                    ))}
                  </section>
                  <section className="activity-section">
                    <div className="section-heading">
                      <div>
                        <h2>{de ? "Letzte Aktivitäten" : "Recent activity"}</h2>
                        <p>
                          {de
                            ? "Zuletzt aktualisierte Projekte in Ihrer Übersicht"
                            : "Latest updated projects in your pipeline"}
                        </p>
                      </div>
                      <button
                        className="workspace-outline"
                        onClick={() => navigate("projects")}
                      >
                        {de ? "Projekte ansehen" : "View projects"}
                        <Icon name="chevron" size={14} />
                      </button>
                    </div>
                    {rows(projects.slice(0, 4))}
                  </section>
                </>
              )}
              {page === "requests" && (
                <section>
                  {requests.length ? (
                    rows(requests)
                  ) : (
                    <div className="workspace-empty">
                      <Icon name="new" size={28} />
                      <h3>{de ? "Keine neuen Anfragen" : "No new requests"}</h3>
                      <p>
                        {de
                          ? "Alle eingegangenen Anfragen wurden bearbeitet."
                          : "All incoming requests have been reviewed."}
                      </p>
                    </div>
                  )}
                </section>
              )}
              {page === "projects" && (
                <section>
                  {managedProjects.some(
                    (p) => filter === "all" || p.status === filter,
                  ) ? (
                    rows(
                      managedProjects.filter(
                        (p) => filter === "all" || p.status === filter,
                      ),
                    )
                  ) : (
                    <div className="workspace-empty">
                      <Icon name="projects" size={28} />
                      <h3>
                        {de
                          ? "Keine passenden Projekte"
                          : "No matching projects"}
                      </h3>
                      <p>
                        {de
                          ? "Projekte mit diesem Status erscheinen hier."
                          : "Projects with this status will appear here."}
                      </p>
                      <button
                        className="workspace-outline"
                        onClick={() => setFilter("all")}
                      >
                        {de ? "Alle Projekte anzeigen" : "Show all projects"}
                      </button>
                    </div>
                  )}
                </section>
              )}
            </>
          )}
          {!(project && projectView === "chat") && (
            <footer className="workspace-footer">
              {de
                ? "Beispieldaten · Lokale Vorschau · Kein echtes Benutzerkonto"
                : "Example data · Local preview · No real user account"}
            </footer>
          )}
        </div>
      </div>
    </div>
  );
}
