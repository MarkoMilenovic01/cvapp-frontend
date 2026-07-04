import { useEffect, useState } from "react";
import { ApiError } from "../api/apiClient";
import * as jobApi from "../api/jobApi";
import type {
  ApplicationStatus,
  JobApplicationResponse,
  JobRequest,
  JobResponse,
  PageResponse,
} from "../types/job";

const emptyJob: JobRequest = {
  title: "",
  description: "",
  requirements: "",
  location: "",
  employmentType: "",
  workMode: "",
  deadline: null,
};

const statuses: ApplicationStatus[] = [
  "APPLIED",
  "REVIEWED",
  "SHORTLISTED",
  "CONTACTED",
  "REJECTED",
  "ACCEPTED",
];

export default function CompanyJobsSection() {
  const [jobForm, setJobForm] = useState<JobRequest>(emptyJob);
  const [editingJobId, setEditingJobId] = useState<number | null>(null);

  const [jobPage, setJobPage] = useState<PageResponse<JobResponse> | null>(
    null
  );
  const [page, setPage] = useState(0);

  const [selectedJob, setSelectedJob] = useState<JobResponse | null>(null);
  const [applications, setApplications] = useState<JobApplicationResponse[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [applicationsLoading, setApplicationsLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadJobs(0);
  }, []);

  async function loadJobs(nextPage = page) {
    try {
      setLoading(true);
      setError("");

      const response = await jobApi.getMyCompanyJobs(nextPage);

      setJobPage(response);
      setPage(response.number);
    } catch (err) {
      handleError(err, "Something went wrong while loading company jobs");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveJob(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setMessage("");
      setError("");

      const cleanedRequest: JobRequest = {
        ...jobForm,
        deadline: jobForm.deadline || null,
      };

      if (editingJobId) {
        await jobApi.updateCompanyJob(editingJobId, cleanedRequest);
        setMessage("Job updated successfully.");
      } else {
        await jobApi.createCompanyJob(cleanedRequest);
        setMessage("Job created successfully.");
      }

      setJobForm(emptyJob);
      setEditingJobId(null);

      await loadJobs(0);
    } catch (err) {
      handleError(err, "Something went wrong while saving job");
    }
  }

  function handleEditJob(job: JobResponse) {
    setEditingJobId(job.id);
    setJobForm({
      title: job.title ?? "",
      description: job.description ?? "",
      requirements: job.requirements ?? "",
      location: job.location ?? "",
      employmentType: job.employmentType ?? "",
      workMode: job.workMode ?? "",
      deadline: job.deadline ?? null,
    });
  }

  function handleCancelEdit() {
    setEditingJobId(null);
    setJobForm(emptyJob);
  }

  async function handleDeleteJob(id: number) {
    try {
      setMessage("");
      setError("");

      await jobApi.deleteCompanyJob(id);

      if (selectedJob?.id === id) {
        setSelectedJob(null);
        setApplications([]);
      }

      setMessage("Job deleted successfully.");
      await loadJobs(page);
    } catch (err) {
      handleError(err, "Something went wrong while deleting job");
    }
  }

  async function handleViewApplications(job: JobResponse) {
    try {
      setApplicationsLoading(true);
      setMessage("");
      setError("");

      setSelectedJob(job);

      const response = await jobApi.getApplicationsForJob(job.id);
      setApplications(response);
    } catch (err) {
      handleError(err, "Something went wrong while loading applications");
    } finally {
      setApplicationsLoading(false);
    }
  }

  async function handleUpdateStatus(
    applicationId: number,
    status: ApplicationStatus
  ) {
    try {
      setMessage("");
      setError("");

      await jobApi.updateApplicationStatus(applicationId, { status });

      setMessage("Application status updated.");

      if (selectedJob) {
        const response = await jobApi.getApplicationsForJob(selectedJob.id);
        setApplications(response);
      }
    } catch (err) {
      handleError(err, "Something went wrong while updating status");
    }
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
      <h2>Company Jobs</h2>

      {message && <p>{message}</p>}
      {error && <p>{error}</p>}

      <h3>{editingJobId ? "Edit job" : "Create job"}</h3>

      <form onSubmit={handleSaveJob}>
        <div>
          <label>Title</label>
          <input
            value={jobForm.title}
            onChange={(event) =>
              setJobForm({ ...jobForm, title: event.target.value })
            }
          />
        </div>

        <div>
          <label>Description</label>
          <textarea
            value={jobForm.description}
            onChange={(event) =>
              setJobForm({ ...jobForm, description: event.target.value })
            }
          />
        </div>

        <div>
          <label>Requirements</label>
          <textarea
            value={jobForm.requirements}
            onChange={(event) =>
              setJobForm({ ...jobForm, requirements: event.target.value })
            }
          />
        </div>

        <div>
          <label>Location</label>
          <input
            value={jobForm.location}
            onChange={(event) =>
              setJobForm({ ...jobForm, location: event.target.value })
            }
          />
        </div>

        <div>
          <label>Employment type</label>
          <select
            value={jobForm.employmentType}
            onChange={(event) =>
              setJobForm({
                ...jobForm,
                employmentType: event.target.value as JobRequest["employmentType"],
              })
            }
          >
            <option value="">Select type</option>
            <option value="INTERNSHIP">Internship</option>
            <option value="STUDENT_WORK">Student work</option>
            <option value="PART_TIME">Part time</option>
            <option value="FULL_TIME">Full time</option>
          </select>
        </div>

        <div>
          <label>Work mode</label>
          <select
            value={jobForm.workMode}
            onChange={(event) =>
              setJobForm({
                ...jobForm,
                workMode: event.target.value as JobRequest["workMode"],
              })
            }
          >
            <option value="">Select work mode</option>
            <option value="ONSITE">Onsite</option>
            <option value="REMOTE">Remote</option>
            <option value="HYBRID">Hybrid</option>
          </select>
        </div>

        <div>
          <label>Deadline</label>
          <input
            type="date"
            value={jobForm.deadline ?? ""}
            onChange={(event) =>
              setJobForm({
                ...jobForm,
                deadline: event.target.value || null,
              })
            }
          />
        </div>

        <button type="submit">{editingJobId ? "Update job" : "Create job"}</button>

        {editingJobId && (
          <button type="button" onClick={handleCancelEdit}>
            Cancel edit
          </button>
        )}
      </form>

      <hr />

      <h3>My posted jobs</h3>

      {loading ? (
        <p>Loading jobs...</p>
      ) : (
        <>
          {jobPage?.content.length === 0 && <p>No jobs posted yet.</p>}

          {jobPage?.content.map((job) => (
            <div key={job.id}>
              <h4>{job.title}</h4>

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

              <p>
                <strong>Active:</strong> {job.active ? "Yes" : "No"}
              </p>

              <button type="button" onClick={() => handleEditJob(job)}>
                Edit
              </button>

              <button type="button" onClick={() => handleDeleteJob(job.id)}>
                Delete
              </button>

              <button type="button" onClick={() => handleViewApplications(job)}>
                View applications
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

      <h3>Applications</h3>

      {!selectedJob && <p>Select a job to view applications.</p>}

      {selectedJob && (
        <>
          <p>
            Applications for: <strong>{selectedJob.title}</strong>
          </p>

          {applicationsLoading ? (
            <p>Loading applications...</p>
          ) : applications.length === 0 ? (
            <p>No applications for this job yet.</p>
          ) : (
            applications.map((application) => (
              <div key={application.id}>
                <p>
                  <strong>Applicant:</strong> {application.cvFirstName}{" "}
                  {application.cvLastName}
                </p>

                <p>
                  <strong>Status:</strong> {application.status}
                </p>

                <p>
                  <strong>Applied at:</strong>{" "}
                  {new Date(application.appliedAt).toLocaleString()}
                </p>

                <label>Change status</label>
                <select
                  value={application.status}
                  onChange={(event) =>
                    handleUpdateStatus(
                      application.id,
                      event.target.value as ApplicationStatus
                    )
                  }
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                <hr />
              </div>
            ))
          )}
        </>
      )}
    </section>
  );
}