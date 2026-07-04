import { useEffect, useState } from "react";
import { ApiError } from "../api/apiClient";
import * as companyApi from "../api/companyApi";
import { useAuth } from "../context/AuthContext";
import CompanyProfileSection from "./CompanyProfileSection";
import type {
  CompanyCVDetailResponse,
  CompanyCVSummaryResponse,
  CVSearchRequest,
  CVViewResponse,
  PageResponse,
} from "../types/company";

import CompanyJobsSection from "./CompanyJobsSection";

const emptySearch: CVSearchRequest = {
  keyword: "",
  skill: "",
  location: "",
};

export default function CompanyDashboardPage() {
  const { logout } = useAuth();

  const [search, setSearch] = useState<CVSearchRequest>(emptySearch);
  const [page, setPage] = useState(0);
  const [cvPage, setCvPage] =
    useState<PageResponse<CompanyCVSummaryResponse> | null>(null);

  const [selectedCV, setSelectedCV] =
    useState<CompanyCVDetailResponse | null>(null);

  const [favorites, setFavorites] = useState<CompanyCVSummaryResponse[]>([]);
  const [history, setHistory] = useState<CVViewResponse[]>([]);

 const [activeTab, setActiveTab] = useState<
  "profile" | "cvs" | "favorites" | "history" | "jobs"
>("profile");

  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadCVs(0);
    loadFavorites();
    loadHistory();
  }, []);

  async function loadCVs(nextPage = page) {
    try {
      setLoading(true);
      setError("");

      const hasSearch =
        search.keyword.trim() || search.skill.trim() || search.location.trim();

      const response = hasSearch
        ? await companyApi.searchCVs(search, nextPage)
        : await companyApi.getAllCVs(nextPage);

      setCvPage(response);
      setPage(response.number);
    } catch (err) {
      handleError(err, "Something went wrong while loading CVs");
    } finally {
      setLoading(false);
    }
  }

  async function loadFavorites() {
    try {
      const response = await companyApi.getFavorites();
      setFavorites(response);
    } catch (err) {
      handleError(err, "Something went wrong while loading favorites");
    }
  }

  async function loadHistory() {
    try {
      const response = await companyApi.getHistory();
      setHistory(response);
    } catch (err) {
      handleError(err, "Something went wrong while loading history");
    }
  }

  async function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSelectedCV(null);
    await loadCVs(0);
  }

  async function handleClearSearch() {
    setSearch(emptySearch);
    setSelectedCV(null);

    try {
      setLoading(true);
      setError("");

      const response = await companyApi.getAllCVs(0);

      setCvPage(response);
      setPage(response.number);
    } catch (err) {
      handleError(err, "Something went wrong while loading CVs");
    } finally {
      setLoading(false);
    }
  }

  async function handleViewCV(id: number) {
    try {
      setDetailsLoading(true);
      setMessage("");
      setError("");

      const response = await companyApi.getCVById(id);

      setSelectedCV(response);

      await loadHistory();
    } catch (err) {
      handleError(err, "Something went wrong while loading CV details");
    } finally {
      setDetailsLoading(false);
    }
  }

  async function handleToggleFavorite(cv: CompanyCVSummaryResponse) {
    try {
      setMessage("");
      setError("");

      if (cv.favorite) {
        await companyApi.removeFavorite(cv.id);
        setMessage("CV removed from favorites.");
      } else {
        await companyApi.addFavorite(cv.id);
        setMessage("CV added to favorites.");
      }

      await loadCVs(page);
      await loadFavorites();
    } catch (err) {
      handleError(err, "Something went wrong while updating favorite");
    }
  }

  async function handleToggleFavoriteFromDetails() {
    if (!selectedCV) return;

    const summaryCV = findSummaryById(selectedCV.id);

    if (!summaryCV) {
      return;
    }

    await handleToggleFavorite(summaryCV);
  }

  function findSummaryById(id: number) {
    const fromPage = cvPage?.content.find((cv) => cv.id === id);

    if (fromPage) {
      return fromPage;
    }

    return favorites.find((cv) => cv.id === id);
  }

  function handleError(err: unknown, fallback: string) {
    if (err instanceof ApiError) {
      setError(err.message);
    } else {
      setError(fallback);
    }
  }

  const currentSelectedSummary = selectedCV
    ? findSummaryById(selectedCV.id)
    : null;

  return (
    <main>
      <h1>Company Dashboard</h1>

      <button onClick={logout}>Logout</button>

      <hr />

      <nav>
        <button type="button" onClick={() => setActiveTab("profile")}>
  Profile
</button>

        <button type="button" onClick={() => setActiveTab("cvs")}>
          Search CVs
        </button>

        <button type="button" onClick={() => setActiveTab("favorites")}>
          Favorites
        </button>

        <button type="button" onClick={() => setActiveTab("history")}>
          View history
        </button>

        <button type="button" onClick={() => setActiveTab("jobs")}>
  Jobs
</button>
      </nav>

      {message && <p>{message}</p>}
      {error && <p>{error}</p>}

      <hr />

      {activeTab === "profile" && <CompanyProfileSection />}

      {activeTab === "cvs" && (
        <section>
          <h2>Search CVs</h2>

          <form onSubmit={handleSearchSubmit}>
            <div>
              <label>Keyword</label>
              <input
                value={search.keyword}
                placeholder="Name, summary, etc."
                onChange={(event) =>
                  setSearch({ ...search, keyword: event.target.value })
                }
              />
            </div>

            <div>
              <label>Skill</label>
              <input
                value={search.skill}
                placeholder="Java, React, Docker..."
                onChange={(event) =>
                  setSearch({ ...search, skill: event.target.value })
                }
              />
            </div>

            <div>
              <label>Location</label>
              <input
                value={search.location}
                placeholder="Maribor, Ljubljana..."
                onChange={(event) =>
                  setSearch({ ...search, location: event.target.value })
                }
              />
            </div>

            <button type="submit">Search</button>
            <button type="button" onClick={handleClearSearch}>
              Clear
            </button>
          </form>

          <hr />

          {loading ? (
            <p>Loading CVs...</p>
          ) : (
            <>
              <CVList
                cvs={cvPage?.content ?? []}
                onView={handleViewCV}
                onToggleFavorite={handleToggleFavorite}
              />

              {cvPage && !cvPage.empty && (
                <div>
                  <button
                    type="button"
                    disabled={cvPage.first}
                    onClick={() => loadCVs(page - 1)}
                  >
                    Previous
                  </button>

                  <span>
                    {" "}
                    Page {cvPage.number + 1} of {cvPage.totalPages}{" "}
                  </span>

                  <button
                    type="button"
                    disabled={cvPage.last}
                    onClick={() => loadCVs(page + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {activeTab === "favorites" && (
        <section>
          <h2>Favorite CVs</h2>

          <button type="button" onClick={loadFavorites}>
            Refresh favorites
          </button>

          <CVList
            cvs={favorites}
            onView={handleViewCV}
            onToggleFavorite={handleToggleFavorite}
          />
        </section>
      )}

      {activeTab === "history" && (
        <section>
          <h2>Viewing history</h2>

          <button type="button" onClick={loadHistory}>
            Refresh history
          </button>

          {history.length === 0 ? (
            <p>No viewed CVs yet.</p>
          ) : (
            history.map((item) => (
              <div key={`${item.cvId}-${item.viewedAt}`}>
                <p>
                  <strong>
                    {item.firstName} {item.lastName}
                  </strong>
                </p>

                <p>Viewed at: {new Date(item.viewedAt).toLocaleString()}</p>

                <button type="button" onClick={() => handleViewCV(item.cvId)}>
                  Open CV
                </button>

                <hr />
              </div>
            ))
          )}
        </section>
      )}

      {activeTab === "jobs" && <CompanyJobsSection />}

      <hr />

      <section>
        <h2>Selected CV</h2>

        {detailsLoading && <p>Loading CV details...</p>}

        {!detailsLoading && !selectedCV && <p>No CV selected.</p>}

        {selectedCV && (
          <CVDetails
            cv={selectedCV}
            favorite={currentSelectedSummary?.favorite ?? false}
            onToggleFavorite={handleToggleFavoriteFromDetails}
          />
        )}
      </section>
    </main>
  );
}

function CVList({
  cvs,
  onView,
  onToggleFavorite,
}: {
  cvs: CompanyCVSummaryResponse[];
  onView: (id: number) => void;
  onToggleFavorite: (cv: CompanyCVSummaryResponse) => void;
}) {
  if (cvs.length === 0) {
    return <p>No CVs found.</p>;
  }

  return (
    <>
      {cvs.map((cv) => (
        <div key={cv.id}>
          <h3>
            {cv.firstName} {cv.lastName}
          </h3>

          <p>{cv.summary || "No summary."}</p>

          <button type="button" onClick={() => onView(cv.id)}>
            View CV
          </button>

          <button type="button" onClick={() => onToggleFavorite(cv)}>
            {cv.favorite ? "Remove favorite" : "Add favorite"}
          </button>

          <hr />
        </div>
      ))}
    </>
  );
}

function CVDetails({
  cv,
  favorite,
  onToggleFavorite,
}: {
  cv: CompanyCVDetailResponse;
  favorite: boolean;
  onToggleFavorite: () => void;
}) {
  return (
    <article>
      <h3>
        {cv.firstName} {cv.lastName}
      </h3>

      <button type="button" onClick={onToggleFavorite}>
        {favorite ? "Remove favorite" : "Add favorite"}
      </button>

      {cv.profilePhotoUrl && (
        <div>
          <img
            src={cv.profilePhotoUrl}
            alt={`${cv.firstName} ${cv.lastName}`}
            width={120}
            height={120}
          />
        </div>
      )}

      <p>
        <strong>Phone:</strong> {cv.phone || "-"}
      </p>

      <p>
        <strong>Address:</strong> {cv.address || "-"}
      </p>

      <p>
        <strong>Summary:</strong> {cv.summary || "-"}
      </p>

      {cv.linkedinUrl && (
        <p>
          <strong>LinkedIn:</strong>{" "}
          <a href={cv.linkedinUrl} target="_blank" rel="noreferrer">
            {cv.linkedinUrl}
          </a>
        </p>
      )}

      {cv.githubUrl && (
        <p>
          <strong>GitHub:</strong>{" "}
          <a href={cv.githubUrl} target="_blank" rel="noreferrer">
            {cv.githubUrl}
          </a>
        </p>
      )}

      {cv.pdfUrl && (
        <p>
          <strong>PDF:</strong>{" "}
          <a href={cv.pdfUrl} target="_blank" rel="noreferrer">
            Open PDF
          </a>
        </p>
      )}

      <hr />

      <h4>Education</h4>

      {cv.education.length === 0 ? (
        <p>No education added.</p>
      ) : (
        cv.education.map((education) => (
          <div key={education.id}>
            <p>
              <strong>{education.institution}</strong>
            </p>
            <p>
              {education.degree} - {education.fieldOfStudy}
            </p>
            <p>
              {education.startDate || "?"} -{" "}
              {education.current ? "Current" : education.endDate || "?"}
            </p>
          </div>
        ))
      )}

      <hr />

      <h4>Experience</h4>

      {cv.experience.length === 0 ? (
        <p>No experience added.</p>
      ) : (
        cv.experience.map((experience) => (
          <div key={experience.id}>
            <p>
              <strong>{experience.position}</strong> at{" "}
              {experience.companyName}
            </p>
            <p>{experience.description}</p>
            <p>
              {experience.startDate || "?"} -{" "}
              {experience.current ? "Current" : experience.endDate || "?"}
            </p>
          </div>
        ))
      )}

      <hr />

      <h4>Skills</h4>

      {cv.skills.length === 0 ? (
        <p>No skills added.</p>
      ) : (
        <ul>
          {cv.skills.map((skill) => (
            <li key={skill.id}>
              {skill.name} - {skill.level}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}