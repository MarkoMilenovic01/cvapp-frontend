import { useEffect, useState } from "react";
import { ApiError } from "../api/apiClient";
import * as adminApi from "../api/adminApi";
import { useAuth } from "../context/AuthContext";
import type {
  AdminCompanyResponse,
  AdminJobResponse,
  AdminStatsResponse,
  AdminUserResponse,
  PageResponse,
} from "../types/admin";
import type { Role } from "../types/auth";

type AdminTab = "stats" | "users" | "companies" | "jobs" | "invites";

export default function AdminDashboardPage() {
  const { logout } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminTab>("stats");

  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [usersPage, setUsersPage] =
    useState<PageResponse<AdminUserResponse> | null>(null);
  const [companiesPage, setCompaniesPage] =
    useState<PageResponse<AdminCompanyResponse> | null>(null);
  const [jobsPage, setJobsPage] =
    useState<PageResponse<AdminJobResponse> | null>(null);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteCompanyName, setInviteCompanyName] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (activeTab === "stats") loadStats();
    if (activeTab === "users") loadUsers(0);
    if (activeTab === "companies") loadCompanies(0);
    if (activeTab === "jobs") loadJobs(0);
  }, [activeTab]);

  function handleError(err: unknown, fallback: string) {
    if (err instanceof ApiError) {
      setError(err.message);
    } else {
      setError(fallback);
    }
  }

  async function loadStats() {
    try {
      setLoading(true);
      setError("");

      const response = await adminApi.getAdminStats();
      setStats(response);
    } catch (err) {
      handleError(err, "Something went wrong while loading admin stats");
    } finally {
      setLoading(false);
    }
  }

  async function loadUsers(page = usersPage?.number ?? 0) {
    try {
      setLoading(true);
      setError("");

      const response = await adminApi.getAdminUsers(page);
      setUsersPage(response);
    } catch (err) {
      handleError(err, "Something went wrong while loading users");
    } finally {
      setLoading(false);
    }
  }

  async function loadCompanies(page = companiesPage?.number ?? 0) {
    try {
      setLoading(true);
      setError("");

      const response = await adminApi.getAdminCompanies(page);
      setCompaniesPage(response);
    } catch (err) {
      handleError(err, "Something went wrong while loading companies");
    } finally {
      setLoading(false);
    }
  }

  async function loadJobs(page = jobsPage?.number ?? 0) {
    try {
      setLoading(true);
      setError("");

      const response = await adminApi.getAdminJobs(page);
      setJobsPage(response);
    } catch (err) {
      handleError(err, "Something went wrong while loading jobs");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleUser(id: number) {
    try {
      setMessage("");
      setError("");

      await adminApi.toggleUserEnabled(id);
      setMessage("User status updated.");
      await loadUsers();
    } catch (err) {
      handleError(err, "Something went wrong while toggling user");
    }
  }

  async function handleChangeUserRole(id: number, role: Role) {
    try {
      setMessage("");
      setError("");

      await adminApi.changeUserRole(id, { role });
      setMessage("User role updated.");
      await loadUsers();
    } catch (err) {
      handleError(err, "Something went wrong while changing user role");
    }
  }

  async function handleDeleteUser(id: number) {
    if (!window.confirm("Delete this user?")) return;

    try {
      setMessage("");
      setError("");

      await adminApi.deleteUser(id);
      setMessage("User deleted.");
      await loadUsers();
    } catch (err) {
      handleError(err, "Something went wrong while deleting user");
    }
  }

  async function handleDeleteCompany(id: number) {
    if (!window.confirm("Delete this company?")) return;

    try {
      setMessage("");
      setError("");

      await adminApi.deleteCompany(id);
      setMessage("Company deleted.");
      await loadCompanies();
    } catch (err) {
      handleError(err, "Something went wrong while deleting company");
    }
  }

  async function handleToggleJob(id: number) {
    try {
      setMessage("");
      setError("");

      await adminApi.toggleJobActive(id);
      setMessage("Job status updated.");
      await loadJobs();
    } catch (err) {
      handleError(err, "Something went wrong while toggling job");
    }
  }

  async function handleDeleteJob(id: number) {
    if (!window.confirm("Delete this job?")) return;

    try {
      setMessage("");
      setError("");

      await adminApi.deleteJob(id);
      setMessage("Job deleted.");
      await loadJobs();
    } catch (err) {
      handleError(err, "Something went wrong while deleting job");
    }
  }

  async function handleSendInvite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setMessage("");
      setError("");

      await adminApi.sendCompanyInvite({
        email: inviteEmail,
        companyName: inviteCompanyName,
      });

      setInviteEmail("");
      setInviteCompanyName("");
      setMessage("Company invite sent.");
    } catch (err) {
      handleError(err, "Something went wrong while sending invite");
    }
  }

  return (
    <main>
      <h1>Admin Dashboard</h1>

      <button type="button" onClick={logout}>
        Logout
      </button>

      <hr />

      <nav>
        <button type="button" onClick={() => setActiveTab("stats")}>
          Stats
        </button>

        <button type="button" onClick={() => setActiveTab("users")}>
          Users
        </button>

        <button type="button" onClick={() => setActiveTab("companies")}>
          Companies
        </button>

        <button type="button" onClick={() => setActiveTab("jobs")}>
          Jobs
        </button>

        <button type="button" onClick={() => setActiveTab("invites")}>
          Company invites
        </button>
      </nav>

      <hr />

      {message && <p>{message}</p>}
      {error && <p>{error}</p>}
      {loading && <p>Loading...</p>}

      {activeTab === "stats" && stats && (
        <section>
          <h2>Stats</h2>

          <p>Total users: {stats.totalUsers}</p>
          <p>Total companies: {stats.totalCompanies}</p>
          <p>Total CVs: {stats.totalCVs}</p>
          <p>Total jobs: {stats.totalJobs}</p>
          <p>Active jobs: {stats.activeJobs}</p>
          <p>Inactive jobs: {stats.inactiveJobs}</p>
          <p>Total applications: {stats.totalApplications}</p>

          <button type="button" onClick={loadStats}>
            Refresh stats
          </button>
        </section>
      )}

      {activeTab === "users" && (
        <section>
          <h2>Users</h2>

          <button type="button" onClick={() => loadUsers()}>
            Refresh users
          </button>

          {usersPage?.content.length === 0 && <p>No users found.</p>}

          {usersPage?.content.map((user) => (
            <div key={user.id}>
              <h3>{user.email}</h3>

              <p>ID: {user.id}</p>
              <p>Role: {user.role}</p>
              <p>Enabled: {user.enabled ? "Yes" : "No"}</p>
              <p>Provider: {user.provider}</p>
              <p>Created at: {new Date(user.createdAt).toLocaleString()}</p>

              <label>Change role</label>
              <select
                value={user.role}
                onChange={(event) =>
                  handleChangeUserRole(user.id, event.target.value as Role)
                }
              >
                <option value="USER">USER</option>
                <option value="COMPANY">COMPANY</option>
                <option value="ADMIN">ADMIN</option>
              </select>

              <br />

              <button type="button" onClick={() => handleToggleUser(user.id)}>
                {user.enabled ? "Disable" : "Enable"}
              </button>

              <button type="button" onClick={() => handleDeleteUser(user.id)}>
                Delete user
              </button>

              <hr />
            </div>
          ))}

          {usersPage && !usersPage.empty && (
            <div>
              <button
                type="button"
                disabled={usersPage.first}
                onClick={() => loadUsers(usersPage.number - 1)}
              >
                Previous
              </button>

              <span>
                {" "}
                Page {usersPage.number + 1} of {usersPage.totalPages}{" "}
              </span>

              <button
                type="button"
                disabled={usersPage.last}
                onClick={() => loadUsers(usersPage.number + 1)}
              >
                Next
              </button>
            </div>
          )}
        </section>
      )}

      {activeTab === "companies" && (
        <section>
          <h2>Companies</h2>

          <button type="button" onClick={() => loadCompanies()}>
            Refresh companies
          </button>

          {companiesPage?.content.length === 0 && <p>No companies found.</p>}

          {companiesPage?.content.map((company) => (
            <div key={company.id}>
              <h3>{company.name}</h3>

              {company.photoUrl && (
                <img
                  src={company.photoUrl}
                  alt={company.name}
                  width={100}
                  height={100}
                />
              )}

              <p>ID: {company.id}</p>
              <p>User ID: {company.userId}</p>
              <p>Email: {company.email}</p>
              <p>Industry: {company.industry || "-"}</p>
              <p>Description: {company.description || "-"}</p>

              {company.website && (
                <p>
                  Website:{" "}
                  <a href={company.website} target="_blank" rel="noreferrer">
                    {company.website}
                  </a>
                </p>
              )}

              <p>Created at: {new Date(company.createdAt).toLocaleString()}</p>

              <button
                type="button"
                onClick={() => handleDeleteCompany(company.id)}
              >
                Delete company
              </button>

              <hr />
            </div>
          ))}

          {companiesPage && !companiesPage.empty && (
            <div>
              <button
                type="button"
                disabled={companiesPage.first}
                onClick={() => loadCompanies(companiesPage.number - 1)}
              >
                Previous
              </button>

              <span>
                {" "}
                Page {companiesPage.number + 1} of{" "}
                {companiesPage.totalPages}{" "}
              </span>

              <button
                type="button"
                disabled={companiesPage.last}
                onClick={() => loadCompanies(companiesPage.number + 1)}
              >
                Next
              </button>
            </div>
          )}
        </section>
      )}

      {activeTab === "jobs" && (
        <section>
          <h2>Jobs</h2>

          <button type="button" onClick={() => loadJobs()}>
            Refresh jobs
          </button>

          {jobsPage?.content.length === 0 && <p>No jobs found.</p>}

          {jobsPage?.content.map((job) => (
            <div key={job.id}>
              <h3>{job.title}</h3>

              <p>ID: {job.id}</p>
              <p>Company: {job.companyName}</p>
              <p>Location: {job.location || "-"}</p>
              <p>Employment type: {job.employmentType}</p>
              <p>Work mode: {job.workMode}</p>
              <p>Deadline: {job.deadline ?? "-"}</p>
              <p>Active: {job.active ? "Yes" : "No"}</p>
              <p>Created at: {new Date(job.createdAt).toLocaleString()}</p>

              <p>
                <strong>Description:</strong>
              </p>
              <p>{job.description}</p>

              <p>
                <strong>Requirements:</strong>
              </p>
              <p>{job.requirements}</p>

              <button type="button" onClick={() => handleToggleJob(job.id)}>
                {job.active ? "Deactivate" : "Activate"}
              </button>

              <button type="button" onClick={() => handleDeleteJob(job.id)}>
                Delete job
              </button>

              <hr />
            </div>
          ))}

          {jobsPage && !jobsPage.empty && (
            <div>
              <button
                type="button"
                disabled={jobsPage.first}
                onClick={() => loadJobs(jobsPage.number - 1)}
              >
                Previous
              </button>

              <span>
                {" "}
                Page {jobsPage.number + 1} of {jobsPage.totalPages}{" "}
              </span>

              <button
                type="button"
                disabled={jobsPage.last}
                onClick={() => loadJobs(jobsPage.number + 1)}
              >
                Next
              </button>
            </div>
          )}
        </section>
      )}

      {activeTab === "invites" && (
        <section>
          <h2>Invite company</h2>

          <form onSubmit={handleSendInvite}>
            <div>
              <label>Company email</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
              />
            </div>

            <div>
              <label>Company name</label>
              <input
                value={inviteCompanyName}
                onChange={(event) => setInviteCompanyName(event.target.value)}
              />
            </div>

            <button type="submit">Send invite</button>
          </form>
        </section>
      )}
    </main>
  );
}