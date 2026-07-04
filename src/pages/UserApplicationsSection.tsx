import { useEffect, useState } from "react";
import { ApiError } from "../api/apiClient";
import * as jobApi from "../api/jobApi";
import type { JobApplicationResponse } from "../types/job";

export default function UserApplicationsSection() {
  const [applications, setApplications] = useState<JobApplicationResponse[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadApplications();
  }, []);

  async function loadApplications() {
    try {
      setLoading(true);
      setError("");

      const response = await jobApi.getMyApplications();
      setApplications(response);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Something went wrong while loading applications");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleWithdraw(applicationId: number) {
    try {
      setMessage("");
      setError("");

      await jobApi.withdrawApplication(applicationId);

      setMessage("Application withdrawn successfully.");
      await loadApplications();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Something went wrong while withdrawing application");
      }
    }
  }

  if (loading) {
    return <p>Loading applications...</p>;
  }

  return (
    <section>
      <h2>My Applications</h2>

      <button type="button" onClick={loadApplications}>
        Refresh
      </button>

      {message && <p>{message}</p>}
      {error && <p>{error}</p>}

      {applications.length === 0 ? (
        <p>You have not applied to any jobs yet.</p>
      ) : (
        applications.map((application) => (
          <div key={application.id}>
            <h3>{application.jobTitle}</h3>

            <p>
              <strong>Company:</strong> {application.companyName}
            </p>

            <p>
              <strong>CV:</strong> {application.cvFirstName}{" "}
              {application.cvLastName}
            </p>

            <p>
              <strong>Status:</strong> {application.status}
            </p>

            <p>
              <strong>Applied at:</strong>{" "}
              {new Date(application.appliedAt).toLocaleString()}
            </p>

            <button
              type="button"
              disabled={
                application.status === "WITHDRAWN" ||
                application.status === "REJECTED" ||
                application.status === "ACCEPTED"
              }
              onClick={() => handleWithdraw(application.id)}
            >
              Withdraw
            </button>

            <hr />
          </div>
        ))
      )}
    </section>
  );
}