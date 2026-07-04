import { useEffect, useState } from "react";
import { ApiError } from "../api/apiClient";
import * as jobApi from "../api/jobApi";
import type {
  JobApplicationResponse,
  JobResponse,
  JobSearchFilter,
  PageResponse,
} from "../types/job";

import { useNavigate } from "react-router-dom";

const emptyFilter: JobSearchFilter = {
  keyword: "",
  location: "",
  employmentType: "",
  workMode: "",
};

export default function UserJobsSection() {

    const navigate = useNavigate();

    
  const [filter, setFilter] = useState<JobSearchFilter>(emptyFilter);
  const [page, setPage] = useState(0);
  const [jobPage, setJobPage] = useState<PageResponse<JobResponse> | null>(
    null
  );

  const [selectedJob, setSelectedJob] = useState<JobResponse | null>(null);
  const [applications, setApplications] = useState<JobApplicationResponse[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadJobs(0);
    loadApplications();
  }, []);

  async function loadJobs(nextPage = page) {
    try {
      setLoading(true);
      setError("");

      const hasFilter =
        filter.keyword.trim() ||
        filter.location.trim() ||
        filter.employmentType ||
        filter.workMode;

      const response = hasFilter
        ? await jobApi.searchJobs(filter, nextPage)
        : await jobApi.getAllActiveJobs(nextPage);

      setJobPage(response);
      setPage(response.number);
    } catch (err) {
      handleError(err, "Something went wrong while loading jobs");
    } finally {
      setLoading(false);
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

  async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSelectedJob(null);
    await loadJobs(0);
  }

  async function handleClearSearch() {
    setFilter(emptyFilter);
    setSelectedJob(null);

    try {
      setLoading(true);
      setError("");

      const response = await jobApi.getAllActiveJobs(0);

      setJobPage(response);
      setPage(response.number);
    } catch (err) {
      handleError(err, "Something went wrong while loading jobs");
    } finally {
      setLoading(false);
    }
  }

  async function handleViewJob(id: number) {
    try {
      setDetailsLoading(true);
      setMessage("");
      setError("");

      const response = await jobApi.getActiveJobById(id);
      setSelectedJob(response);
    } catch (err) {
      handleError(err, "Something went wrong while loading job details");
    } finally {
      setDetailsLoading(false);
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

  return (
    <section>
      <h2>Available Jobs</h2>

      {message && <p>{message}</p>}
      {error && <p>{error}</p>}

      <form onSubmit={handleSearch}>
        <div>
          <label>Keyword</label>
          <input
            value={filter.keyword}
            placeholder="Backend, Java, React..."
            onChange={(event) =>
              setFilter({ ...filter, keyword: event.target.value })
            }
          />
        </div>

        <div>
          <label>Location</label>
          <input
            value={filter.location}
            placeholder="Maribor, Remote..."
            onChange={(event) =>
              setFilter({ ...filter, location: event.target.value })
            }
          />
        </div>

        <div>
          <label>Employment type</label>
          <select
            value={filter.employmentType}
            onChange={(event) =>
              setFilter({
                ...filter,
                employmentType: event.target.value as JobSearchFilter["employmentType"],
              })
            }
          >
            <option value="">Any</option>
            <option value="INTERNSHIP">Internship</option>
            <option value="STUDENT_WORK">Student work</option>
            <option value="PART_TIME">Part time</option>
            <option value="FULL_TIME">Full time</option>
          </select>
        </div>

        <div>
          <label>Work mode</label>
          <select
            value={filter.workMode}
            onChange={(event) =>
              setFilter({
                ...filter,
                workMode: event.target.value as JobSearchFilter["workMode"],
              })
            }
          >
            <option value="">Any</option>
            <option value="ONSITE">Onsite</option>
            <option value="REMOTE">Remote</option>
            <option value="HYBRID">Hybrid</option>
          </select>
        </div>

        <button type="submit">Search jobs</button>
        <button type="button" onClick={handleClearSearch}>
          Clear
        </button>
      </form>

      <hr />

      {loading ? (
        <p>Loading jobs...</p>
      ) : (
        <>
          {jobPage?.content.length === 0 && <p>No jobs found.</p>}

          {jobPage?.content.map((job) => (
            <div key={job.id}>
              <h3>{job.title}</h3>

              <p>
                <strong>Company:</strong> {job.companyName}
                <button
  type="button"
  onClick={() => navigate(`/companies/${job.companyId}`)}
>
  View company
</button>
              </p>

              <p>
                <strong>Location:</strong> {job.location}
              </p>

              <p>
                <strong>Type:</strong> {job.employmentType}
              </p>

              <p>
                <strong>Work mode:</strong> {job.workMode}
              </p>

              <p>
                <strong>Deadline:</strong> {job.deadline ?? "-"}
              </p>

              <button type="button" onClick={() => handleViewJob(job.id)}>
                View job
              </button>

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
                onClick={() => loadJobs(page - 1)}
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
                onClick={() => loadJobs(page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <hr />

      <h2>Selected Job</h2>

      {detailsLoading && <p>Loading job details...</p>}

      {!detailsLoading && !selectedJob && <p>No job selected.</p>}

      {selectedJob && (
        <article>
          <h3>{selectedJob.title}</h3>

          <p>
            <strong>Company:</strong> {selectedJob.companyName}
          </p>

          <p>
            <strong>Location:</strong> {selectedJob.location}
          </p>

          <p>
            <strong>Employment type:</strong> {selectedJob.employmentType}
          </p>

          <p>
            <strong>Work mode:</strong> {selectedJob.workMode}
          </p>

          <p>
            <strong>Deadline:</strong> {selectedJob.deadline ?? "-"}
          </p>

          <p>
            <strong>Description:</strong>
          </p>
          <p>{selectedJob.description}</p>

          <p>
            <strong>Requirements:</strong>
          </p>
          <p>{selectedJob.requirements}</p>

          <button
            type="button"
            disabled={hasApplied(selectedJob.id)}
            onClick={() => handleApply(selectedJob.id)}
          >
            {hasApplied(selectedJob.id) ? "Already applied" : "Apply"}
          </button>

          <button
  type="button"
  onClick={() => navigate(`/companies/${selectedJob.companyId}`)}
>
  View company profile
</button>
        </article>
      )}
    </section>
  );
}