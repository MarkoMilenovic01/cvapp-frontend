import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ApiError } from "../api/apiClient";
import * as companyDirectoryApi from "../api/companyDirectoryApi";
import * as jobApi from "../api/jobApi";
import type { CompanyResponse } from "../types/company";
import type {
  JobApplicationResponse,
  JobResponse,
  PageResponse,
} from "../types/job";

export default function UserCompanyProfilePage() {
  const { companyId } = useParams();

  const numericCompanyId = Number(companyId);

  const [company, setCompany] = useState<CompanyResponse | null>(null);
  const [jobPage, setJobPage] = useState<PageResponse<JobResponse> | null>(
    null
  );
  const [applications, setApplications] = useState<JobApplicationResponse[]>(
    []
  );

  const [page, setPage] = useState(0);

  const [loading, setLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!Number.isNaN(numericCompanyId)) {
      loadCompany();
      loadCompanyJobs(0);
      loadApplications();
    }
  }, [numericCompanyId]);

  async function loadCompany() {
    try {
      setLoading(true);
      setError("");

      const response = await companyDirectoryApi.getCompanyById(
        numericCompanyId
      );

      setCompany(response);
    } catch (err) {
      handleError(err, "Something went wrong while loading company profile");
    } finally {
      setLoading(false);
    }
  }

  async function loadCompanyJobs(nextPage = page) {
    try {
      setJobsLoading(true);
      setError("");

      const response = await companyDirectoryApi.getActiveJobsByCompany(
        numericCompanyId,
        nextPage
      );

      setJobPage(response);
      setPage(response.number);
    } catch (err) {
      handleError(err, "Something went wrong while loading company jobs");
    } finally {
      setJobsLoading(false);
    }
  }

  async function loadApplications() {
    try {
      const response = await jobApi.getMyApplications();
      setApplications(response);
    } catch (err) {
      handleError(err, "Something went wrong while loading applications");
    }
  }

  async function handleApply(jobId: number) {
    try {
      setMessage("");
      setError("");

      await jobApi.applyToJob(jobId);

      setMessage("Application submitted successfully.");
      await loadApplications();
    } catch (err) {
      handleError(err, "Something went wrong while applying to job");
    }
  }

  function hasApplied(jobId: number) {
    return applications.some(
      (application) =>
        application.jobId === jobId && application.status !== "WITHDRAWN"
    );
  }

  function handleError(err: unknown, fallback: string) {
    if (err instanceof ApiError) {
      setError(err.message);
    } else {
      setError(fallback);
    }
  }

  if (Number.isNaN(numericCompanyId)) {
    return (
      <main>
        <p>Invalid company ID.</p>
        <Link to="/user">Back to dashboard</Link>
      </main>
    );
  }

  if (loading) {
    return <main>Loading company profile...</main>;
  }

  return (
    <main>
      <Link to="/user">Back to user dashboard</Link>

      <hr />

      {message && <p>{message}</p>}
      {error && <p>{error}</p>}

      {!company ? (
        <p>Company not found.</p>
      ) : (
        <section>
          <h1>{company.name}</h1>

          {company.photoUrl && (
            <img
              src={company.photoUrl}
              alt={company.name}
              width={140}
              height={140}
            />
          )}

          <p>
            <strong>Industry:</strong> {company.industry || "-"}
          </p>

          <p>
            <strong>Description:</strong> {company.description || "-"}
          </p>

          {company.website && (
            <p>
              <strong>Website:</strong>{" "}
              <a href={company.website} target="_blank" rel="noreferrer">
                {company.website}
              </a>
            </p>
          )}

          <p>
            <strong>Created at:</strong>{" "}
            {new Date(company.createdAt).toLocaleString()}
          </p>
        </section>
      )}

      <hr />

      <section>
        <h2>Jobs from this company</h2>

        {jobsLoading ? (
          <p>Loading jobs...</p>
        ) : (
          <>
            {jobPage?.content.length === 0 && (
              <p>This company has no active jobs right now.</p>
            )}

            {jobPage?.content.map((job) => (
              <div key={job.id}>
                <h3>{job.title}</h3>

                <p>
                  <strong>Location:</strong> {job.location || "-"}
                </p>

                <p>
                  <strong>Employment type:</strong> {job.employmentType}
                </p>

                <p>
                  <strong>Work mode:</strong> {job.workMode}
                </p>

                <p>
                  <strong>Deadline:</strong> {job.deadline ?? "-"}
                </p>

                <p>
                  <strong>Description:</strong>
                </p>
                <p>{job.description}</p>

                <p>
                  <strong>Requirements:</strong>
                </p>
                <p>{job.requirements}</p>

                <button
                  type="button"
                  disabled={hasApplied(job.id)}
                  onClick={() => handleApply(job.id)}
                >
                  {hasApplied(job.id) ? "Already applied" : "Apply"}
                </button>

                <hr />
              </div>
            ))}

            {jobPage && !jobPage.empty && (
              <div>
                <button
                  type="button"
                  disabled={jobPage.first}
                  onClick={() => loadCompanyJobs(page - 1)}
                >
                  Previous
                </button>

                <span>
                  {" "}
                  Page {jobPage.number + 1} of {jobPage.totalPages}{" "}
                </span>

                <button
                  type="button"
                  disabled={jobPage.last}
                  onClick={() => loadCompanyJobs(page + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}