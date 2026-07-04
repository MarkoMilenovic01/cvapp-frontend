import { useEffect, useState } from "react";
import { ApiError } from "../api/apiClient";
import * as cvApi from "../api/cvApi";
import { useAuth } from "../context/AuthContext";
import type {
  CVRequest,
  CVResponse,
  EducationRequest,
  ExperienceRequest,
  SkillRequest,
} from "../types/cv";

const emptyCV: CVRequest = {
  firstName: "",
  lastName: "",
  phone: "",
  address: "",
  summary: "",
  linkedinUrl: "",
  githubUrl: "",
  education: [],
  experience: [],
  skills: [],
};

const emptyEducation: EducationRequest = {
  institution: "",
  degree: "",
  fieldOfStudy: "",
  startDate: null,
  endDate: null,
  current: false,
};

const emptyExperience: ExperienceRequest = {
  companyName: "",
  position: "",
  description: "",
  startDate: null,
  endDate: null,
  current: false,
};

const emptySkill: SkillRequest = {
  name: "",
  level: "",
};

export default function UserDashboardPage() {
  const { logout } = useAuth();

  const [cv, setCv] = useState<CVRequest>(emptyCV);
  const [savedCV, setSavedCV] = useState<CVResponse | null>(null);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadCV();
  }, []);

  async function loadCV() {
    try {
      setLoading(true);
      setError("");

      const response = await cvApi.getMyCV();

      setSavedCV(response);
      setCv({
        firstName: response.firstName ?? "",
        lastName: response.lastName ?? "",
        phone: response.phone ?? "",
        address: response.address ?? "",
        summary: response.summary ?? "",
        linkedinUrl: response.linkedinUrl ?? "",
        githubUrl: response.githubUrl ?? "",
        education: response.education ?? [],
        experience: response.experience ?? [],
        skills: response.skills ?? [],
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setCv(emptyCV);
      } else if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Something went wrong while loading your CV");
      }
    } finally {
      setLoading(false);
    }
  }

  function cleanCVBeforeSave(): CVRequest {
    return {
      ...cv,
      education: cv.education.map((education) => ({
        ...education,
        startDate: education.startDate || null,
        endDate: education.current ? null : education.endDate || null,
      })),
      experience: cv.experience.map((experience) => ({
        ...experience,
        startDate: experience.startDate || null,
        endDate: experience.current ? null : experience.endDate || null,
      })),
      skills: cv.skills,
    };
  }

  async function handleSave() {
    try {
      setMessage("");
      setError("");

      const response = await cvApi.saveCV(cleanCVBeforeSave());

      setSavedCV(response);
      setMessage("CV saved successfully.");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Something went wrong while saving your CV");
      }
    }
  }

  async function handleDeleteCV() {
    try {
      setMessage("");
      setError("");

      await cvApi.deleteCV();

      setSavedCV(null);
      setCv(emptyCV);
      setMessage("CV deleted successfully.");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Something went wrong while deleting your CV");
      }
    }
  }

  async function handleUploadPhoto() {
    if (!photoFile) return;

    try {
      setMessage("");
      setError("");

      await cvApi.uploadCVPhoto(photoFile);
      setPhotoFile(null);
      setMessage("Profile photo uploaded successfully.");

      await loadCV();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Something went wrong while uploading photo");
      }
    }
  }

  async function handleUploadPdf() {
    if (!pdfFile) return;

    try {
      setMessage("");
      setError("");

      await cvApi.uploadCVPdf(pdfFile);
      setPdfFile(null);
      setMessage("PDF uploaded successfully.");

      await loadCV();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Something went wrong while uploading PDF");
      }
    }
  }

  function addEducation() {
    setCv({
      ...cv,
      education: [...cv.education, { ...emptyEducation }],
    });
  }

  function updateEducation(index: number, updated: EducationRequest) {
    setCv({
      ...cv,
      education: cv.education.map((item, i) => (i === index ? updated : item)),
    });
  }

  function removeEducation(index: number) {
    setCv({
      ...cv,
      education: cv.education.filter((_, i) => i !== index),
    });
  }

  function addExperience() {
    setCv({
      ...cv,
      experience: [...cv.experience, { ...emptyExperience }],
    });
  }

  function updateExperience(index: number, updated: ExperienceRequest) {
    setCv({
      ...cv,
      experience: cv.experience.map((item, i) =>
        i === index ? updated : item
      ),
    });
  }

  function removeExperience(index: number) {
    setCv({
      ...cv,
      experience: cv.experience.filter((_, i) => i !== index),
    });
  }

  function addSkill() {
    setCv({
      ...cv,
      skills: [...cv.skills, { ...emptySkill }],
    });
  }

  function updateSkill(index: number, updated: SkillRequest) {
    setCv({
      ...cv,
      skills: cv.skills.map((item, i) => (i === index ? updated : item)),
    });
  }

  function removeSkill(index: number) {
    setCv({
      ...cv,
      skills: cv.skills.filter((_, i) => i !== index),
    });
  }

  if (loading) {
    return <main>Loading CV...</main>;
  }

  return (
    <main>
      <h1>User Dashboard</h1>

      <button onClick={logout}>Logout</button>

      <hr />

      <h2>My CV</h2>

      {savedCV ? (
        <p>CV ID: {savedCV.id}</p>
      ) : (
        <p>You do not have a CV yet. Fill the form and save it.</p>
      )}

      {message && <p>{message}</p>}
      {error && <p>{error}</p>}

      <div>
        <label>First name</label>
        <input
          value={cv.firstName}
          onChange={(event) =>
            setCv({ ...cv, firstName: event.target.value })
          }
        />
      </div>

      <div>
        <label>Last name</label>
        <input
          value={cv.lastName}
          onChange={(event) => setCv({ ...cv, lastName: event.target.value })}
        />
      </div>

      <div>
        <label>Phone</label>
        <input
          value={cv.phone}
          onChange={(event) => setCv({ ...cv, phone: event.target.value })}
        />
      </div>

      <div>
        <label>Address</label>
        <input
          value={cv.address}
          onChange={(event) => setCv({ ...cv, address: event.target.value })}
        />
      </div>

      <div>
        <label>Summary</label>
        <textarea
          value={cv.summary}
          onChange={(event) => setCv({ ...cv, summary: event.target.value })}
        />
      </div>

      <div>
        <label>LinkedIn URL</label>
        <input
          value={cv.linkedinUrl}
          onChange={(event) =>
            setCv({ ...cv, linkedinUrl: event.target.value })
          }
        />
      </div>

      <div>
        <label>GitHub URL</label>
        <input
          value={cv.githubUrl}
          onChange={(event) =>
            setCv({ ...cv, githubUrl: event.target.value })
          }
        />
      </div>

      <hr />

      <h2>Education</h2>

      {cv.education.map((education, index) => (
        <div key={index}>
          <h3>Education #{index + 1}</h3>

          <div>
            <label>Institution</label>
            <input
              value={education.institution}
              onChange={(event) =>
                updateEducation(index, {
                  ...education,
                  institution: event.target.value,
                })
              }
            />
          </div>

          <div>
            <label>Degree</label>
            <input
              value={education.degree}
              onChange={(event) =>
                updateEducation(index, {
                  ...education,
                  degree: event.target.value,
                })
              }
            />
          </div>

          <div>
            <label>Field of study</label>
            <input
              value={education.fieldOfStudy}
              onChange={(event) =>
                updateEducation(index, {
                  ...education,
                  fieldOfStudy: event.target.value,
                })
              }
            />
          </div>

          <div>
            <label>Start date</label>
            <input
              type="date"
              value={education.startDate ?? ""}
              onChange={(event) =>
                updateEducation(index, {
                  ...education,
                  startDate: event.target.value || null,
                })
              }
            />
          </div>

          <div>
            <label>End date</label>
            <input
              type="date"
              value={education.endDate ?? ""}
              disabled={education.current}
              onChange={(event) =>
                updateEducation(index, {
                  ...education,
                  endDate: event.target.value || null,
                })
              }
            />
          </div>

          <div>
            <label>
              <input
                type="checkbox"
                checked={education.current}
                onChange={(event) =>
                  updateEducation(index, {
                    ...education,
                    current: event.target.checked,
                    endDate: event.target.checked ? null : education.endDate,
                  })
                }
              />
              Current
            </label>
          </div>

          <button type="button" onClick={() => removeEducation(index)}>
            Remove education
          </button>

          <hr />
        </div>
      ))}

      <button type="button" onClick={addEducation}>
        Add education
      </button>

      <hr />

      <h2>Experience</h2>

      {cv.experience.map((experience, index) => (
        <div key={index}>
          <h3>Experience #{index + 1}</h3>

          <div>
            <label>Company name</label>
            <input
              value={experience.companyName}
              onChange={(event) =>
                updateExperience(index, {
                  ...experience,
                  companyName: event.target.value,
                })
              }
            />
          </div>

          <div>
            <label>Position</label>
            <input
              value={experience.position}
              onChange={(event) =>
                updateExperience(index, {
                  ...experience,
                  position: event.target.value,
                })
              }
            />
          </div>

          <div>
            <label>Description</label>
            <textarea
              value={experience.description}
              onChange={(event) =>
                updateExperience(index, {
                  ...experience,
                  description: event.target.value,
                })
              }
            />
          </div>

          <div>
            <label>Start date</label>
            <input
              type="date"
              value={experience.startDate ?? ""}
              onChange={(event) =>
                updateExperience(index, {
                  ...experience,
                  startDate: event.target.value || null,
                })
              }
            />
          </div>

          <div>
            <label>End date</label>
            <input
              type="date"
              value={experience.endDate ?? ""}
              disabled={experience.current}
              onChange={(event) =>
                updateExperience(index, {
                  ...experience,
                  endDate: event.target.value || null,
                })
              }
            />
          </div>

          <div>
            <label>
              <input
                type="checkbox"
                checked={experience.current}
                onChange={(event) =>
                  updateExperience(index, {
                    ...experience,
                    current: event.target.checked,
                    endDate: event.target.checked ? null : experience.endDate,
                  })
                }
              />
              Current
            </label>
          </div>

          <button type="button" onClick={() => removeExperience(index)}>
            Remove experience
          </button>

          <hr />
        </div>
      ))}

      <button type="button" onClick={addExperience}>
        Add experience
      </button>

      <hr />

      <h2>Skills</h2>

      {cv.skills.map((skill, index) => (
        <div key={index}>
          <h3>Skill #{index + 1}</h3>

          <div>
            <label>Name</label>
            <input
              value={skill.name}
              onChange={(event) =>
                updateSkill(index, {
                  ...skill,
                  name: event.target.value,
                })
              }
            />
          </div>

          <div>
            <label>Level</label>
            <input
              value={skill.level}
              placeholder="Beginner / Intermediate / Advanced"
              onChange={(event) =>
                updateSkill(index, {
                  ...skill,
                  level: event.target.value,
                })
              }
            />
          </div>

          <button type="button" onClick={() => removeSkill(index)}>
            Remove skill
          </button>

          <hr />
        </div>
      ))}

      <button type="button" onClick={addSkill}>
        Add skill
      </button>

      <hr />

      <button onClick={handleSave}>Save CV</button>

      {savedCV && (
        <button onClick={handleDeleteCV} style={{ marginLeft: "8px" }}>
          Delete CV
        </button>
      )}

      <hr />

      <h2>Profile photo</h2>

      {savedCV?.profilePhotoUrl && (
        <img
          src={savedCV.profilePhotoUrl}
          alt="Profile"
          width={120}
          height={120}
        />
      )}

      <input
        type="file"
        accept="image/*"
        onChange={(event) => setPhotoFile(event.target.files?.[0] ?? null)}
      />

      <button onClick={handleUploadPhoto} disabled={!photoFile}>
        Upload photo
      </button>

      <hr />

      <h2>CV PDF</h2>

      {savedCV?.pdfUrl && (
        <p>
          <a href={savedCV.pdfUrl} target="_blank" rel="noreferrer">
            Open uploaded PDF
          </a>
        </p>
      )}

      <input
        type="file"
        accept="application/pdf"
        onChange={(event) => setPdfFile(event.target.files?.[0] ?? null)}
      />

      <button onClick={handleUploadPdf} disabled={!pdfFile}>
        Upload PDF
      </button>
    </main>
  );
}